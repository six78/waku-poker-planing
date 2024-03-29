import { IIssue, IRemoteIssue } from './issue.model';
import { isUrl } from '../shared/url';
import { generateHash } from '../shared/random-hash';
import { getIssueFromGithub } from './providers/github-issue-provider';

async function getRemoteIssue(issueUrl: string): Promise<IRemoteIssue | null> {
  if (!isUrl(issueUrl)) {
    return null;
  }

  return getIssueFromGithub(issueUrl);
}


export function createIssueFromString(data: string): IIssue {
  // TODO: display issue title in card

  const issue: IIssue = {
    id: generateHash(),
    titleOrUrl: data,
    result: null,
    votes: {}
  };

  return issue;
}

export async function tryGetIssueDescription(issueUrl: string): Promise<string> {
  const issueDetails = await getRemoteIssue(issueUrl);
  return issueDetails?.description || '';

}
