import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiKeysConfig } from 'src/config/apiKeys.config';
import { Config } from 'src/config/config.types';
import { graphql, GraphQlQueryResponseData } from '@octokit/graphql';
import { Commit, Ref } from '@octokit/graphql-schema';
import { GraphQlQueryResponse } from '@octokit/graphql/dist-types/types';

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);

  constructor(private readonly config: ConfigService<Config>) {
    if (!this.hasGithubToken()) {
      this.logger.error(
        'No github  pat provided. Please add `GITHUB_PAT` to your .env file',
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

  async commitsSince(date: string): Promise<Commit[]> {
    console.log('###HERE', date);

    const { repository, errors }: any = await this.client(
      `query CommitsSince($since: GitTimestamp!){
          repository(name: "light-speed-racing-discord", owner: "arelstone") {
            ref(qualifiedName: "master") {
              target {
                ... on Commit {
                  history(first: 20, since: $since) {
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
        since: date,
      },
    );
    if (errors) {
      this.logger.warn(`Error: ${JSON.stringify(errors, null, 2)}`);
      return;
    }

    return repository?.ref?.target?.history?.edges.map(({ node }) => node);
  }
}
