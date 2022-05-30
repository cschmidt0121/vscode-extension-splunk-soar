import * as vscode from 'vscode'
import { MultiStepInput } from '../apps/runAction';
import { getClientForActiveEnvironment } from '../../soar/client';

export interface IPlaybookContext {
    data: {
        playbook: {
            id: string,
            name: string
        }
    }
}

export async function runPlaybookInput(context: vscode.ExtensionContext, playbookContext: IPlaybookContext) {
    class MyButton implements vscode.QuickInputButton {
        constructor(public iconPath: { light: vscode.Uri; dark: vscode.Uri; }, public tooltip: string) { }
    }
    const skipParamButton = new MyButton({
        dark: vscode.Uri.file(context.asAbsolutePath('resources/dark/debug-step-over.svg')),
        light: vscode.Uri.file(context.asAbsolutePath('resources/light/debug-step-over.svg')),
    }, 'Skip');
    
    interface PlaybookRunState {
        playbook_id: string;
        container_id: string
        scope: vscode.QuickPickItem;
    }

    const title = `Run Playbook: ${JSON.stringify(playbookContext.data.playbook.name)}`;
    const totalSteps = 1;

    async function collectInputs() {
        const state = {
            parameters: [{}]
        } as Partial<PlaybookRunState>;
        await MultiStepInput.run(input => pickContainer(input, state));
        return state as PlaybookRunState;
    }

	function shouldResume() {
		// Could show a notification with the option to resume.
		return new Promise<boolean>((resolve, reject) => {
			// noop
		});
	}
	async function validateContainerExists(containerId: string) {
		let client = await getClientForActiveEnvironment(context)

		try {
			await client.getContainer(containerId)
			return undefined
		} catch {
			return 'Container was not found in Splunk SOAR. Please enter a valid ID.'
		}
	}

    async function pickContainer(input: MultiStepInput, state: Partial<PlaybookRunState>){
        state.container_id = await input.showInputBox({
			title,
			step: 1,
			totalSteps: totalSteps,
			value: state.container_id || '',
			prompt: `Container ID`,
			shouldResume: shouldResume,
            validate: validateContainerExists
		});

        return (input: MultiStepInput) => scopeInput(input, state);

    }

    async function scopeInput(input: MultiStepInput, state: Partial<PlaybookRunState>){
        let scopePick = await input.showQuickPick({
            title,
            step: 2,
            totalSteps: totalSteps,
            placeholder: 'Scope?',
            items: [{"label": "all"}, {"label": "new"}],
            shouldResume: shouldResume
        });
        state.scope = scopePick
    }    

    const state = await collectInputs();
    console.log(state)

}
