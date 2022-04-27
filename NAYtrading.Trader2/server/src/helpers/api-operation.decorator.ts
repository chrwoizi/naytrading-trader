import { ApiOperation as NestApiOperation } from '@nestjs/swagger';

type ApiOperationMetadata = Parameters<typeof NestApiOperation>['0'];

/**
 * Creates a custom ApiOperation Decorator to export only method names without controller name to openapi/swagger.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ApiOperation = (op?: ApiOperationMetadata) => (
  target,
  prop,
  descriptor
) => {
  if (!op) {
    op = {};
  }
  if (!op.operationId) {
    op.operationId = prop.toString();
  }
  NestApiOperation(op)(target, prop, descriptor);
};
