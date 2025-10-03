// Jenkins Pipeline for Node.js App (written by Deepika)
// This pipeline builds, tests, scans, and pushes a Docker image
// Jenkins is configured via JCasC YAML (jenkins-casc.yaml)
// Author: Deepika
//
// Logging and audit:
// - All build, test, image build, and scan steps use 'set -eux' for verbose logs
// - JUnit and artifact archiving ensure test and log retention
// - Audit Trail plugin logs user actions (configured in Jenkins UI/global config)

pipeline {
    agent any
    options {
        buildDiscarder(logRotator(numToKeepStr: '7', daysToKeepStr: '10')) // Retain last 7 builds or 10 days
    }
    environment {
        DOCKER_REPO = 'docker.io/deepika21868496' // DockerHub repo
        APP_IMAGE = 'secure-devops2-app' // Image name
        DOCKER_DAEMON = 'tcp://dind:2376'
        CERTS_PATH = '/certs'
    }
    stages {
        stage('Checkout Source') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }
        stage('Dependencies & Test') {
            agent { docker { image 'node:16-alpine' } }
            steps {
                echo 'Installing dependencies and running tests...'
                sh '''
                    set -eux
                    npm install
                    npm test -- --ci --reporters=default --reporters=jest-junit
                '''
                junit 'junit.xml'
                archiveArtifacts artifacts: '**/junit.xml,logs/**/*.log', allowEmptyArchive: true
            }
        }
        stage('Trivy Filesystem Scan') {
            steps {
                echo 'Running Trivy vulnerability scan on workspace...'
                sh '''
                    set -eux
                    mkdir -p "$WORKSPACE/bin"
                    if [ ! -f "$WORKSPACE/bin/trivy" ]; then
                      curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b "$WORKSPACE/bin"
                    fi
                    export PATH="$WORKSPACE/bin:$PATH"
                    trivy fs --severity HIGH,CRITICAL --exit-code 1 --no-progress .
                '''
            }
        }
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                script {
                    def shortCommit = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.IMAGE_TAG = shortCommit
                }
                sh '''
                    set -eux
                    docker build -t ${DOCKER_REPO}/${APP_IMAGE}:${IMAGE_TAG} -t ${DOCKER_REPO}/${APP_IMAGE}:latest .
                '''
            }
        }
        stage('Image Scan') {
            steps {
                echo 'Scanning Docker image with Trivy...'
                sh '''
                    set -eux
                    mkdir -p "$WORKSPACE/bin"
                    if [ ! -f "$WORKSPACE/bin/trivy" ]; then
                      curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b "$WORKSPACE/bin"
                    fi
                    export PATH="$WORKSPACE/bin:$PATH"
                    trivy image --severity HIGH,CRITICAL --exit-code 1 --no-progress ${DOCKER_REPO}/${APP_IMAGE}:${IMAGE_TAG}
                '''
            }
        }
        stage('Push Docker Image') {
            steps {
                echo 'Pushing Docker image to registry...'
                withDockerRegistry([credentialsId: 'docker-hub-credentials', url: '']) {
                    sh '''
                        set -eux
                        docker push ${DOCKER_REPO}/${APP_IMAGE}:${IMAGE_TAG}
                        docker push ${DOCKER_REPO}/${APP_IMAGE}:latest
                    '''
                }
            }
        }
    }
    post {
        always {
            echo 'Cleaning up Docker resources and workspace...'
            sh 'docker system prune -f || true'
        }
    }
}
