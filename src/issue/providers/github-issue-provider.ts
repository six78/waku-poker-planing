import { ITaskTrackerIssue } from '../issue.model';

interface IGithubIssue {
  html_url: string;
  body: string;
  title: string;
}

const githubSettings = {
  url: 'https://github.com',
  apiUrl: 'https://api.github.com/repos'
}


export async function getIssueFromGithub(issueUrl: string): Promise<ITaskTrackerIssue | null> {
  const isGithub = issueUrl.indexOf(githubSettings.url) === 0;

  if (!isGithub) {
    return null;
  }

  const apiUrl = issueUrl.replace(
    githubSettings.url,
    githubSettings.apiUrl
  );

  try {
    const response = await fetch(apiUrl);
    const result = await response.json() as IGithubIssue;

    return {
      name: result.title,
      description: result.body
    }
  } catch {
    return null
  }
}