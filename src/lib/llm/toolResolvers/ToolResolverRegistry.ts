/**
 * Tool Resolver Registry - Manages and applies tool resolvers
 *
 * Provides a centralized registry for tool parameter resolvers,
 * allowing for clean separation of tool-specific resolution logic.
 */

import { ToolResolver, ToolResolverParams } from './ToolResolver';
import { StationResolver } from './StationResolver';
import { LocationResolver } from './LocationResolver';

export class ToolResolverRegistry {
  private resolvers: ToolResolver[] = [];

  constructor() {
    // Register default resolvers
    this.registerResolver(new StationResolver());
    this.registerResolver(new LocationResolver());
  }

  /**
   * Register a new resolver
   */
  registerResolver(resolver: ToolResolver): void {
    this.resolvers.push(resolver);
  }

  /**
   * Apply all applicable resolvers to the given tool parameters
   */
  async resolve(
    toolName: string,
    params: ToolResolverParams,
    executeTool: (name: string, params: any) => Promise<any>
  ): Promise<ToolResolverParams> {
    let resolvedParams = params;

    // Find and apply the first matching resolver
    for (const resolver of this.resolvers) {
      if (resolver.canResolve(toolName, resolvedParams)) {
        console.log(`[ToolResolverRegistry] Applying resolver for ${toolName}`);
        resolvedParams = await resolver.resolve(resolvedParams, executeTool);
        break; // Only apply one resolver per tool call
      }
    }

    return resolvedParams;
  }
}

// Export singleton instance
export const toolResolverRegistry = new ToolResolverRegistry();
