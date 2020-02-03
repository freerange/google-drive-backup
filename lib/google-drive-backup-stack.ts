import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as aas from '@aws-cdk/aws-applicationautoscaling';
import { ScheduledFargateTaskOnPublicSubnet } from './scheduled-fargate-task-on-public-subnet';

export class GoogleDriveBackupStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'backupTaskDefinition', {
      cpu: 4 * 1024,
      memoryLimitMiB: 16 * 1024
    });
    taskDefinition.addContainer('backupTaskContainer', {
      image: ecs.ContainerImage.fromAsset('./local-image'),
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
