#!/usr/bin/env groovy
//@formatter:off
def repositoryName = 'quill-render'
def gitRepoUrl = "https://github.com/buildcom/${repositoryName}.git"
def nodeJSInstallationName = 'NodeJS v10+'
def commitId = null
String pullRequestId = null

def isRelease = null

// For master branches we want to enforce building sequentially.
if (BRANCH_NAME == 'master')
{
	properties([disableConcurrentBuilds()])
}

ansiColor('gnome-terminal') { timestamps {
node
{

	deleteDir()
	stage('Checkout')
	{
		commitId = checkout([$class: 'GitSCM', branches: scm.branches, extensions: [[$class: 'LocalBranch', localBranch: '**', noTags: false, shallow: false, depth: 0, reference: '']], userRemoteConfigs: scm.userRemoteConfigs]).GIT_COMMIT
		if (commitId != null && !commitId.isEmpty())
		{
			echo "Commit id = ${commitId}"
		}
		else
		{
			echo 'WARNING Unable to retrieve commit id.'
			echo "Commit id = ${commitId}"
		}
		def pullRequestIdResponse = gitPullRequestId(repositoryName, BRANCH_NAME)
		if (pullRequestIdResponse.get("pullRequestId") == null)
		{
			echo 'WARNING Unable to determine pull request id.'
			echo pullRequestIdResponse.get("message")
		}
		else
		{
			echo pullRequestIdResponse.get("message")
			pullRequestId = pullRequestIdResponse.get("pullRequestId")
		}
		pullRequestIdResponse = null
		stage('Stash')
		{
			stash name: "${repositoryName}-${BUILD_NUMBER}", useDefaultExcludes: false
		}
		if(BRANCH_NAME == 'master')
		{
			setJiraLabels(repositoryName)
		}
		// grab the commitMessage and determine if this is a release
		def commitMessage = sh returnStdout: true, script: "git log -1 --pretty=%B | cat"
		isRelease = commitMessage.contains("chore(release)")
	}
	stage('Build and Test')
	{
		deleteDir()
		unstash "${repositoryName}-${BUILD_NUMBER}"
		nodejs(nodeJSInstallationName: nodeJSInstallationName)
		{
			stage('NPM install for testing')
			{
				sh 'npm install'
			}
			stage('Run Tests')
			{
				sh 'npm run test'
			}
		}
	}
	// if the branch is master and not a release commit then we need to make a release commit and push to master
	if (BRANCH_NAME == 'master' && !isRelease)
	{
		stage('Bump Version and Changlog')
		{
			nodejs(nodeJSInstallationName: 'NodeJS v10+')
			{
				withCredentials([[$class: 'UsernamePasswordBinding', credentialsId: '4be01c7d-4888-411d-a5af-bfaf9270b806', variable: 'GITUSERNAMEPASSWORD']])
				{
					// Adjust origin with an authenticated user so it can push changelog, version bumps and tags to master.
					sh "git remote set-url origin ${gitRepoUrl.replaceFirst('github', env.GITUSERNAMEPASSWORD + '@github')}"
					// uses fergy-standard-version to create a release commit with bumped version and updated change log
					sh 'npm run ci-version'
					// this will kick off another jenkins but this time the commit message will have the release message
					sh 'git push --follow-tags origin HEAD:master'
				}
			}
		}
	}
	// if the branch is master and a release commit then its time to publish
	else if (BRANCH_NAME == 'master' && isRelease)
	{
		stage('NPM Publish')
		{
			wrap([$class: 'ConfigFileBuildWrapper', managedFiles: [[fileId: '8f7b0455-3ecd-46a6-b493-f60f3c482f39', targetLocation: '.npmrc', variable: 'NPMCONFIG']]])
			{
				nodejs(nodeJSInstallationName: nodeJSInstallationName)
				{
					String publishedVersion = sh returnStdout: true, script: "npm show @buildcom/${repositoryName} version --silent || true";
					String version = sh returnStdout: true, script: 'node -p \'require("./package.json").version\'';

					// Compare versions and try to publish if they don't match
					if (version.trim() != publishedVersion.trim())
					{
						// Nuke node_modules so we do an clean unlinked install of node_modules to ensure integrity of the publish
						sh 'rm -rf node_modules'
						// install modules
						sh 'npm i --registry https://chico-artifactory.impdir.com/artifactory/api/npm/npm-repo'

						// publish modules to artifactory
						sh 'npm publish --registry https://chico-artifactory.impdir.com/artifactory/api/npm/buildcom-npm-local'
					}
				}
			}
		}
		deleteDir()
	}
}
}}
