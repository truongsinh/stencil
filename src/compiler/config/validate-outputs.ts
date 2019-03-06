import * as d from '@declarations';
import { validateDocs } from './validate-docs';
import { validateOutputTargetAngular } from './validate-outputs-angular';
import { validateOutputTargetDist } from './validate-outputs-dist';
import { validateOutputTargetHydrate } from './validate-outputs-hydrate';
import { validateOutputTargetWww } from './validate-outputs-www';
import { validateOutputTargetDistCollection } from './validate-outputs-dist-collection';
import { validateOutputTargetDistModule } from './validate-outputs-dist-module';
import { validateStats } from './validate-stats';
import { _deprecatedToMultipleTarget } from './_deprecated-validate-multiple-targets';


export function validateOutputTargets(config: d.Config) {

  // setup outputTargets from deprecated config properties
  _deprecatedToMultipleTarget(config);

  if (Array.isArray(config.outputTargets)) {
    config.outputTargets.forEach(outputTarget => {
      if (typeof outputTarget.type !== 'string') {
        outputTarget.type = 'www';
      }

      outputTarget.type = outputTarget.type.trim().toLowerCase() as any;

      if (!VALID_TYPES.includes(outputTarget.type)) {
        throw new Error(`invalid outputTarget type "${outputTarget.type}". Valid target types: ${VALID_TYPES.join(', ')}`);
      }
    });
  }

  validateOutputTargetWww(config);
  validateOutputTargetDist(config);
  validateOutputTargetAngular(config);
  validateOutputTargetHydrate(config);
  validateOutputTargetDistCollection(config);
  validateOutputTargetHydrate(config);
  validateOutputTargetDistModule(config);

  validateDocs(config);
  validateStats(config);

  if (!config.outputTargets || config.outputTargets.length === 0) {
    throw new Error(`outputTarget required`);
  }
}


const VALID_TYPES = [
  'angular',
  'dist',
  'dist-collection',
  'dist-module',
  'dist-selfcontained',
  'docs',
  'docs-json',
  'docs-custom',
  'docs-vscode',
  'hydrate',
  'stats',
  'www'
];
