import { Stack } from './stack';
import { IStackSynthesizer, StackSetSynthesizer } from './stack-synthesizers';
import { Construct } from 'constructs';
import { RegionConcurrencyType } from './cfn-operational-preferences';

export interface StackSetProps {
  /**
   * Name to deploy the stack set name with
   *
   * @default - Derived from construct path.
   */
  readonly stackSetName?: string;

  /**
   * Stack set operational preference for region concurrency type
   *
   * @default - Derived from construct path.
   */
  readonly regionConcurrencyType?: RegionConcurrencyType;

  /**
   * Synthesis method to use while deploying this stack
   *
   * @default - `DefaultStackSynthesizer` if the `@aws-cdk/core:newStyleStackSynthesis` feature flag
   * is set, `LegacyStackSynthesizer` otherwise.
   */
  readonly synthesizer?: IStackSynthesizer;

}

export class StackSet extends Stack {
  /**
   * Name to deploy the stack set name with
   *
   * @default - Derived from construct path.
   */
  readonly stackSetName?: string;

  /**
  * Stack set operational preference for region concurrency type
  *
  * @default - Derived from construct path.
  */
  readonly regionConcurrencyType?: RegionConcurrencyType;

  public constructor(scope: Construct, id: string, props: StackSetProps = {}) {
    super(scope, id, { synthesizer: new StackSetSynthesizer() });

    this.regionConcurrencyType = props.regionConcurrencyType;

  }
}
