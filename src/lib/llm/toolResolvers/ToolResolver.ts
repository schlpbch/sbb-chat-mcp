/**
 * Tool Resolver - Base interface for resolving tool parameters
 *
 * Resolvers handle special parameter transformations before tool execution,
 * such as converting station names to UIC codes or location names to coordinates.
 */

export interface ToolResolverParams {
  [key: string]: any;
}

export interface ToolResolver {
  /**
   * Check if this resolver can handle the given tool and parameters
   */
  canResolve(toolName: string, params: ToolResolverParams): boolean;

  /**
   * Resolve/transform the parameters
   * @returns Transformed parameters or original if no transformation needed
   */
  resolve(
    params: ToolResolverParams,
    executeTool: (name: string, params: any) => Promise<any>
  ): Promise<ToolResolverParams>;
}

/**
 * Base abstract class for tool resolvers
 */
export abstract class BaseToolResolver implements ToolResolver {
  abstract canResolve(toolName: string, params: ToolResolverParams): boolean;
  abstract resolve(
    params: ToolResolverParams,
    executeTool: (name: string, params: any) => Promise<any>
  ): Promise<ToolResolverParams>;

  /**
   * Helper to check if a value is a valid UIC code (7-8 digits)
   */
  protected isUicCode(value: string): boolean {
    return /^\d{7,8}$/.test(value);
  }

  /**
   * Helper to check if coordinates are present
   */
  protected hasCoordinates(params: ToolResolverParams): boolean {
    return 'latitude' in params && 'longitude' in params;
  }
}
