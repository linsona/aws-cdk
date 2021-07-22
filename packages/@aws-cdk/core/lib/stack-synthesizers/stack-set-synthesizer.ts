import { ISynthesisSession } from '../construct-compat';
import { StackSet } from '../stack-set';
import { addStackSetArtifactToAssembly, assertBound } from './_shared';
import { DefaultStackSynthesizer } from './default-synthesizer';
import { SynthesizeStackArtifactOptions } from './stack-synthesizer';
import { DockerImageAssetLocation, DockerImageAssetSource, FileAssetLocation, FileAssetSource } from '../assets';

export interface StackSetSynthesizerProps {

}

export class StackSetSynthesizer extends DefaultStackSynthesizer {
  constructor(props: StackSetSynthesizerProps = {}) {
    super();
    props;
  }

  /**
   * Synthesize the associated stack to the session
   */
  public synthesize(session: ISynthesisSession): void {
    assertBound(this.stack);

    this.synthesizeStackTemplate(this.stack, session);

    const artifactId = this.writeAssetManifest(session);

    this.emitStackSetArtifact(this.stack, session, {
      assumeRoleArn: '',
      cloudFormationExecutionRoleArn: '',
      requiresBootstrapStackVersion: 1,
      bootstrapStackVersionSsmParameter: '',
      additionalDependencies: [artifactId],
    });
  }

  protected emitStackSetArtifact(stackSet: StackSet, session: ISynthesisSession, options: SynthesizeStackArtifactOptions = {}) {
    addStackSetArtifactToAssembly(session, stackSet, options ?? {}, options.additionalDependencies ?? []);
  }

  public addFileAsset(_asset: FileAssetSource): FileAssetLocation {
    throw new Error('File assets are currently unsupported');
  }

  public addDockerImageAsset(_asset: DockerImageAssetSource): DockerImageAssetLocation {
    throw new Error('Docker assets are currently unsupported');
  }
}

