import * as vscode from 'vscode'
import { getClientForActiveEnvironment } from '../soar/client';

export class VaultFileContentProvider implements vscode.TextDocumentContentProvider {
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    constructor(private context: vscode.ExtensionContext) {
	}

    async provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Promise<string> {
        let client = await getClientForActiveEnvironment(this.context)
        return client.getVaultDocument(uri.path.replace(".json", "")).then(function(res) {
            let outJSON = JSON.stringify(res.data, null, '\t')
            return outJSON
        }).catch(function(err) {
            console.log(err)
            return "none"
        })
    }
}