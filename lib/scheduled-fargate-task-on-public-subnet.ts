import { SubnetType } from '@aws-cdk/aws-ec2';
import { ScheduledFargateTask } from '@aws-cdk/aws-ecs-patterns';
import { TaskDefinition } from "@aws-cdk/aws-ecs";
import { EcsTask } from "@aws-cdk/aws-events-targets";

export class ScheduledFargateTaskOnPublicSubnet extends ScheduledFargateTask {
  protected addTaskDefinitionToEventTarget(taskDefinition: TaskDefinition): EcsTask {
    const eventRuleTarget = new EcsTask( {
      cluster: this.cluster,
      taskDefinition,
      subnetSelection: { subnetType: SubnetType.PUBLIC },
      taskCount: this.desiredTaskCount
    });

    this.eventRule.addTarget(eventRuleTarget);

    return eventRuleTarget;
  }
}
