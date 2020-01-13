import cdk = require('@aws-cdk/core');
import ecsPatterns = require('@aws-cdk/aws-ecs-patterns');
import ecs = require('@aws-cdk/aws-ecs');
import events = require('@aws-cdk/aws-events');
import ec2 = require('@aws-cdk/aws-ec2');

export class GoogleDriveBackupStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'vpc', { maxAzs: 1 });
    const cluster = new ecs.Cluster(this, 'cluster', { vpc });

    const backupTask = new ecsPatterns.ScheduledFargateTask(this, 'backupTask', {
      cluster: cluster,
      scheduledFargateTaskImageOptions: {
        image: ecs.ContainerImage.fromAsset('./local-image'),
        cpu: 4 * 1024,
        memoryLimitMiB: 16 * 1024
      },
      schedule: events.Schedule.cron({
        weekDay: 'sun', hour: '0', minute: '30'
      })
    });
  }
}
