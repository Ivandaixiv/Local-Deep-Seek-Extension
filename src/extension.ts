// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Import ollama module
import ollama from 'ollama';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "local-deepseek" is now active!');

		// The command has been defined in the package.json file
		// Now provide the implementation of the command with registerCommand
		// The commandId parameter must match the command field in package.json
		const disposable = vscode.commands.registerCommand('local-deepseek.start', () => {
			// The code you place here will be executed every time your command is executed
			// Display a message box to the user
			vscode.window.showInformationMessage('Local DeepSeek Activated!');

			const panel = vscode.window.createWebviewPanel(
				'localDeepSeek',
				'Local DeepSeek',
				vscode.ViewColumn.One,
				{
					enableScripts: true
				}
			);

			panel.webview.html = getWebviewContent();

			panel.webview.onDidReceiveMessage(async (message) => {

				vscode.window.showInformationMessage('Deepseek is thinking...');

				if(message.command === 'submit') {
					panel.webview.postMessage({command: 'chatResponse', text: 'Thinking...'});
					const userPrompt = message.text;
					let response = '';

					vscode.window.showInformationMessage('Deepseek is speaking...');
					try {
						
						const streamResponse = await ollama.chat({
							model: 'deepseek-r1:8b',
							messages: [{role: 'user', content: userPrompt}],
							stream: true
						});

						for await (const part of streamResponse) {
							response += part.message.content;
							panel.webview.postMessage({command: 'chatResponse', text: response});
						}
					} catch (error) {
						panel.webview.postMessage({command: 'chatResponse', text: 'An error occurred while processing your request.'});
					}
				}
			});
		}
	);

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
function getWebviewContent(): string {
	return /*html*/`
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Local DeepSeek</title>
		</head>
		<body>
			<h1>Welcome to Local DeepSeek!</h1>
			<p>This is a simple webview for the Local DeepSeek extension.</p>
			<textarea id="prompt" style="width: 100%; height: 300px;" placeholder="Ask me something :)"></textarea>
			<button id="submit">Submit</button>
			<div id="response"></div>
			<script>
				const vscode = acquireVsCodeApi();

				document.getElementById('submit').addEventListener('click', () => {
					const text = document.getElementById('prompt').value;
					vscode.postMessage({
						command: 'submit',
						text
					})})
				window.addEventListener('message', event => {
					const { command, text } = event.data;
					if(command === 'chatResponse') {
						document.getElementById('response').innerText = text;
					}
				})
			</script>
		</body>
		</html>
	`;
}

