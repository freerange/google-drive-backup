import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as aas from '@aws-cdk/aws-applicationautoscaling';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as sm from '@aws-cdk/aws-secretsmanager';
import { ScheduledFargateTaskOnPublicSubnet } from './scheduled-fargate-task-on-public-subnet';
import * as dotenv from 'dotenv';

dotenv.config();

export class GoogleDriveBackupStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const servicePrincipal = new iam.ServicePrincipal('ecs-tasks.amazonaws.com');
    const role = new iam.Role(this, 'backupsRole', { assumedBy: servicePrincipal });
    const backupsBucket = new s3.Bucket(this, 'backupsBucket', {
      versioned: true
    });
    backupsBucket.grantReadWrite(role);

    const googleDriveCredentialsSecret = new sm.Secret(this, 'googleDriveCredentials', {
      secretName: '/google-drive-backup/RCLONE_DRIVE_SERVICE_ACCOUNT_CREDENTIALS'
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'backupTaskDefinition', {
      taskRole: role,
      cpu: 4 * 1024,
      memoryLimitMiB: 16 * 1024
    });
    taskDefinition.addContainer('backupTaskContainer', {
      image: ecs.ContainerImage.fromAsset('./local-image'),
      environment: {
        'HEALTHCHECKS_URL': process.env.HEALTHCHECKS_URL || '',
        'GOOGLE_DRIVE_IMPERSONATION_EMAIL': process.env.GOOGLE_DRIVE_IMPERSONATION_EMAIL || '',
        'GOOGLE_DRIVE_FOLDER': process.env.GOOGLE_DRIVE_FOLDER || '',
        'S3_BUCKET_NAME': backupsBucket.bucketName,
        'RCLONE_S3_REGION': process.env.RCLONE_S3_REGION || ''
      },
      secrets: {
        'RCLONE_DRIVE_SERVICE_ACCOUNT_CREDENTIALS': ecs.Secret.fromSecretsManager(
          googleDriveCredentialsSecret
        )
      },
      logging: new ecs.AwsLogDriver({ streamPrefix: this.node.id })
    });

    const vpc = new ec2.Vpc(this, 'vpc', {
      natGateways: 0,
      subnetConfiguration: [
        { name: 'public', cidrMask: 24, subnetType: ec2.SubnetType.PUBLIC }
      ],
    });
    const cluster = new ecs.Cluster(this, 'cluster', { vpc });

    const schedule = aas.Schedule.cron(JSON.parse(process.env.CRON_SCHEDULE || '{}'));

    const backupTask = new ScheduledFargateTaskOnPublicSubnet(this, 'backupTask', {
      cluster: cluster,
      scheduledFargateTaskDefinitionOptions: {
        taskDefinition: taskDefinition
      },
      schedule: schedule
    });
  }
}
