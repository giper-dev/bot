namespace $.$$ {
	export class $giper_bot extends $.$giper_bot {
		override dialog_title(next?: string | null) {
			return this.$.$mol_state_session.value('title', next) ?? super.dialog_title()
		}

		override digest(next?: string) {
			return this.$.$mol_state_session.value('digest', next) ?? ''
		}

		override prompt_text(next?: string) {
			return this.$.$mol_state_session.value('prompt_text', next) ?? ''
		}

		@$mol_mem
		history(next?: string[]) {
			return (
				this.$.$mol_state_session.value('history', next) ??
				$mol_maybe(this.$.$mol_state_arg.value('prompt') || null)
			)
		}

		override messages() {
			return this.history().map((_, i) => this.Message(i))
		}

		@$mol_mem_key
		override message_text(index: number): string {
			let text = this.history()[index] ?? ''
			if ('`#>|='.includes(text[0])) text = '\n' + text // markdown blocks
			return this.message_name(index) + ' ' + text
		}

		message_name(index: number): string {
			return index % 2 ? '🤖' : '🙂'
		}

		@$mol_mem
		override rules() {
			return super.rules().replaceAll('{lang}', this.$.$mol_locale.lang())
		}

		override context() {
			return this.rules()
		}

		@$mol_mem
		override communication() {
			const history = this.history()
			if (history.length % 2 === 0) return

			const model = this.Model().fork()
			for (let i = 0; i < history.length; ++i) {
				if (i % 2) model.tell({ response: history[i], digest: null, title: null })
				else model.ask(history[i])
			}

			try {
				const resp = model.response()
				this.dialog_title(resp.title)
				this.digest(resp.digest)
				this.history([...history, resp.response])
			} catch (error: any) {
				if ($mol_fail_log(error)) {
					this.history([...history, '📛' + error.message])
				}
			}
		}

		override prompt_submit() {
			this.history([...this.history(), ...$mol_maybe(this.prompt_text() || null)])
			this.prompt_text('')
		}

		override reset() {
			this.dialog_title(null)
			this.digest('')
			this.history([])
		}
	}
}
