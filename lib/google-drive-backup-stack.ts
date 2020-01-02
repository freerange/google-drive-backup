import cdk = require('@aws-cdk/core');
import ecsPatterns = require('@aws-cdk/aws-ecs-patterns');
import ecs = require('@aws-cdk/aws-ecs');
import events = require('@aws-cdk/aws-events');

export class GoogleDriveBackupStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const backupTask = new ecsPatterns.ScheduledFargateTask(this, 'backupTask', {
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
