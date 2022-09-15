import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiKeysConfig } from '../config/apiKeys.config';
import { Config } from '../config/config.types';
import { graphql, GraphQlQueryResponseData } from '@octokit/graphql';
import { Commit } from '@octokit/graphql-schema';

export type ServerConfigFiles = {
  'assistRules.json': Record<string, any>;
  'eventRules.json': Record<string, any>;
  'settings.json': Record<string, any>;
  'event.json': Record<string, any>;
};

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);

  constructor(private readonly config: ConfigService<Config>) {
    if (!this.hasGithubToken()) {
      this.logger.error(
        'No github access token provided. Please add `GITHUB_PAT` to your .env file',
      );
    }
  }

  private readonly client = graphql.defaults({
    headers: {
      authorization: `token ${
        this.config.get<ApiKeysConfig>('apiKeys').github
      }`,
    },
  });

  hasGithubToken = (): boolean => {
    return !!this.config.get<ApiKeysConfig>('apiKeys').github;
  };

  async commitsSince(
    since: string,
    numberOfCommits: number,
  ): Promise<Commit[]> {
    const { repository, errors } = await this.client<GraphQlQueryResponseData>(
      `query CommitsSince($since: GitTimestamp!, $numberOfCommits: Int!){
          repository(name: "light-speed-racing-discord", owner: "arelstone") {
            ref(qualifiedName: "master") {
              target {
                ... on Commit {
                  history(first: $numberOfCommits, since: $since) {
                    edges {
                      node {
                        messageHeadline
                        abbreviatedOid
                        commitUrl
                        pushedDate
                        author {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
      }`,
      {
        since,
        numberOfCommits,
      },
    );
    if (errors) {
      this.logger.warn(`Error: ${JSON.stringify(errors, null, 2)}`);
      return;
    }

    return repository?.ref?.target?.history?.edges.map(({ node }) => node);
  }
}
