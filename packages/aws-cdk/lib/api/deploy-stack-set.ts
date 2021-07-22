import { CloudFormationStackSet } from './util/cloudformation';
import { ToolkitInfo } from './toolkit-info';
import * as cxapi from '@aws-cdk/cx-api';
import { ISDK, SdkProvider } from './aws-auth';
import { Tag } from '../cdk-toolkit';
import { print } from '../logging';
import { AssetManifestBuilder } from '../util/asset-manifest-builder';
import { makeBodyParameter } from './deploy-stack';

export interface DeployStackSetResult {
}

export interface DeployStackSetOptions {
  /**
   * The stack to be deployed
   */
  stackSet: cxapi.CloudFormationStackSetArtifact;

  /**
   * The environment to deploy this stack in
   *
   * The environment on the stack artifact may be unresolved, this one
   * must be resolved.
   */
  resolvedEnvironment: cxapi.Environment;

  /**
   * The SDK to use for deploying the stack
   *
   * Should have been initialized with the correct role with which
   * stack operations should be performed.
   */
  sdk: ISDK;

  /**
   * SDK provider (seeded with default credentials)
   *
   * Will exclusively be used to assume publishing credentials (which must
   * start out from current credentials regardless of whether we've assumed an
   * action role to touch the stack or not).
   *
   * Used for the following purposes:
   *
   * - Publish legacy assets.
   * - Upload large CloudFormation templates to the staging bucket.
   */
  sdkProvider: SdkProvider;


  /**
  * Name to deploy the stack under
  *
  * @default - Name from assembly
  */
  deployName?: string;

  /**
   * Tags to pass to CloudFormation to add to stack
   *
   * @default - No tags
   */
  tags?: Tag[];

  /**
   * The collection of extra parameters
   * (in addition to those used for assets)
   * to pass to the deployed template.
   * Note that parameters with `undefined` or empty values will be ignored,
   * and not passed to the template.
   *
   * @default - no additional parameters will be passed to the template
   */
  parameters?: { [name: string]: string | undefined };

  /**
  * Role to pass to CloudFormation to execute the change set
  *
  * @default - Role specified on stack, otherwise current
  */
  roleArn?: string;

  toolkitInfo: ToolkitInfo;
}

export async function deployStackSet(options: DeployStackSetOptions): Promise<DeployStackSetResult> {
  const stackSetArtifact = options.stackSet;
  //const stackEnv = options.resolvedEnvironment;
  const legacyAssets = new AssetManifestBuilder();
  const cfn = options.sdk.cloudFormation();
  const deployName = options.deployName || stackSetArtifact.stackSetName;
  let cloudFormationStackSet = await CloudFormationStackSet.lookup(cfn, deployName);
  const bodyParameter = await makeBodyParameter(stackSetArtifact, options.resolvedEnvironment, legacyAssets, options.toolkitInfo);

  if (!cloudFormationStackSet.exists) {
    print('Creating stack set');
    await cfn.createStackSet({
      StackSetName: deployName,
      TemplateBody: bodyParameter.TemplateBody,
      TemplateURL: bodyParameter.TemplateURL,
    }).promise();
  } else {
    print('Updating stack set');
    await cfn.updateStackSet({
      StackSetName: deployName,
      TemplateBody: bodyParameter.TemplateBody,
      TemplateURL: bodyParameter.TemplateURL,
      OperationPreferences: {
        RegionConcurrencyType: stackSetArtifact.regionConcurrencyType,
      },
      Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM', 'CAPABILITY_AUTO_EXPAND'],
    }).promise();
    // TODO operation wait etc
  }
  return {};
}