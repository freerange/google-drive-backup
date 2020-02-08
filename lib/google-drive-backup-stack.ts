import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as aas from '@aws-cdk/aws-applicationautoscaling';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import { ScheduledFargateTaskOnPublicSubnet } from './scheduled-fargate-task-on-public-subnet';

export class GoogleDriveBackupStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const servicePrincipal = new iam.ServicePrincipal('ecs-tasks.amazonaws.com');
    const role = new iam.Role(this, 'backupsRole', { assumedBy: servicePrincipal });
    const backupsBucket = new s3.Bucket(this, 'backupsBucket');
    backupsBucket.grantReadWrite(role);

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'backupTaskDefinition', {
      taskRole: role,
      cpu: 4 * 1024,
      memoryLimitMiB: 16 * 1024
    });
    taskDefinition.addContainer('backupTaskContainer', {
      image: ecs.ContainerImage.fromAsset('./local-image'),
      environment: {
        'HEALTHCHECKS_URL': 'https://hc-ping.com/be6872b3-58a7-4e1d-94b3-619e3dcecc95',
        'GOOGLE_DRIVE_IMPERSONATION_EMAIL': 'james.mead@gofreerange.com',
        'GOOGLE_DRIVE_FOLDER': 'Go Free Range',
        'S3_BUCKET_NAME': backupsBucket.bucketName,
        'RCLONE_S3_REGION': 'eu-west-2'
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

    const schedule = aas.Schedule.cron({
      weekDay: 'sun', hour: '0', minute: '30'
    });

    const backupTask = new ScheduledFargateTaskOnPublicSubnet(this, 'backupTask', {
      cluster: cluster,
      scheduledFargateTaskDefinitionOptions: {
        taskDefinition: taskDefinition, schedule: schedule
      },
      schedule: schedule
    });
  }
}
