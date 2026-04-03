namespace $.$$ {
	type FileItem = {
		name: string
		content: string
	}

	type Request = {
		message: string // текст запроса пользователя
		files: (string | FileItem)[] // ссылки на приложенные файлы
	}

	type Response = {
		message: string // ответ в свободной форме
		files: string[] // ссылки на файлы для скачивания
		document: string | null // обновление документа в формате markdown
		confidence: number // степень уверенности в ответе от 0 до 1
		digest: string // краткий пересказ всего обсуждения
		title: string // ёмкий заголовок всего обсуждения
	}

	type History = readonly (Request | Response)[]

	export class $giper_bot extends $.$giper_bot {
		@$mol_mem
		override pages() {
			return [this.Space(), this.Dialog(), ...(this.result() ? [this.Result_page(this.version())] : [])]
		}

		result_item() {
			return this.results()[this.version()] as Response | undefined
		}

		override result_title() {
			return this.result_item()?.title ?? super.result_title()
		}

		override digest() {
			const responses = this.history().filter((_, i) => i % 2 === 1) as Response[]
			return responses[responses.length - 1]?.digest ?? ''
		}

		override prompt_text(next?: string) {
			return this.$.$mol_state_session.value('prompt_text', next) ?? ''
		}

		@$mol_mem
		history(next?: History): History {
			return (
				this.$.$mol_state_session.value('history', next) ??
				$mol_maybe(this.$.$mol_state_arg.value('prompt') || null).map(p => ({ message: p, files: [] }))
			)
		}

		override messages() {
			return this.history().map((_, i) => this.Message(i))
		}

		@$mol_mem_key
		override message_text(index: number): string {
			const item = this.history()[index]
			let text = [
				item.message,
				...item.files.map(file => {
					if (typeof file === 'object' && 'name' in file) {
						return `""${$giper_bot.file_card_uri(file.name)}""`
					}
					if (typeof file === 'string' && file.startsWith('data:')) return `""` + file + `""`
					return `\uD83D\uDCCE`
				}),
			].join('\n')

			if ('`#>|='.includes(text[0])) text = '\n' + text // markdown blocks
			return this.message_name(index) + ' ' + text
		}

		message_name(index: number): string {
			return index % 2 ? '🤖' : '🙂'
		}

		@$mol_mem
		results() {
			return this.history().filter(item => 'document' in item && item.document) as Response[]
		}

		@$mol_mem
		version(next?: number) {
			const count = this.results().length
			if (next && next < 0) next = 0
			if (next && next >= count) next = count - 1
			return Math.max(0, next ?? count - 1)
		}

		@$mol_mem
		result(next?: string) {
			return next ?? this.results()[this.version()]?.document ?? ''
		}

		@$mol_mem
		override rules() {
			return super.rules().replaceAll('{lang}', this.$.$mol_locale.lang())
			// .replaceAll( '{document}', this.result().replaceAll( /^/gm, '\t' ) )
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
				const item = history[i]
				if (i % 2) {
					model.tell([{ messsage: item.message }])
				} else {
					const files = item.files.map(f => (typeof f === 'object' && 'content' in f ? f.content : f))
					model.ask([item.message, ...files])
				}
			}

			try {
				const resp = model.response()
				this.history([...history, resp])
			} catch (error: any) {
				if ($mol_promise_like(error)) $mol_fail_hidden(error)
				if ($mol_fail_log(error)) {
					this.history([...history, { message: '📛' + error.message, files: [] }])
				}
			}
		}

		@$mol_action
		override prompt_submit() {
			if (!this.prompt_text() && !this.attach().length) return
			const Picture = $mol_wire_sync(this.$.$mol_picture)
			const meta_map = this.file_meta()
			const files: (string | FileItem)[] = this.attach().map(item => {
				const meta = meta_map.get(item)
				const resp = this.$.$mol_fetch.response(item)
				const mime = resp.mime() ?? meta?.type ?? ''
				if (mime.startsWith('image/')) {
					return Picture.fit(item, 512).url('image/webp')
				}
				const content = resp.text()
				return { name: meta?.name ?? 'file.txt', content } as FileItem
			})
			this.history([...this.history(), { message: this.prompt_text(), files }])
			this.prompt_text('')
			this.attach([])
			this.file_meta(new Map())
		}

		override reset() {
			this.history([])
		}

		override quote_start() {
			this.quote($mol_dom.document.getSelection()?.toString() ?? '')
		}

		override quote_end() {
			let quote = this.quote().trim()
			if (!quote) return

			const [from, to] = this.Prompt_text().Edit().selection()
			if (from !== to) return

			let text = this.prompt_text()
			if (to < text.length - 1) return

			text = (text ? text + '\n' : '') + quote.replaceAll(/^/gm, '> ') + '\n'

			this.prompt_text(text)
			this.Prompt_text().Edit().selection([text.length, text.length])
		}

		@$mol_mem
		file_meta(next?: Map<string, { name: string; type: string }>) {
			return next ?? new Map()
		}

		@$mol_action
		on_attach_files(files: readonly File[]) {
			const meta = new Map(this.file_meta())
			const urls = files.map(file => {
				const url = URL.createObjectURL(file)
				meta.set(url, { name: file.name, type: file.type })
				return url
			})
			this.file_meta(meta)
			this.attach([...this.attach(), ...urls])
		}

		@$mol_mem
		override Attach() {
			const obj = super.Attach()

			obj.attach_new = (files: readonly File[]) => this.on_attach_files(files)

			const self = this
			const orig_Item = obj.Item.bind(obj)

			obj.Item = (id: number) => {
				const btn = orig_Item(id)
				const url = obj.items()[id]
				const meta = self.file_meta().get(url)
				if (meta && !meta.type.startsWith('image/')) {
					btn.sub = () => [self.Attach_card(id)]
				}
				return btn
			}

			return obj
		}

		@$mol_mem_key
		override attach_card_name_text(index: number) {
			const url = this.attach()[index]
			const meta = this.file_meta().get(url)
			return meta?.name ?? 'file'
		}

		@$mol_mem_key
		override attach_card_ext_text(index: number) {
			const url = this.attach()[index]
			const meta = this.file_meta().get(url)
			const name = meta?.name ?? ''
			return name.split('.').pop()?.toUpperCase() ?? ''
		}

		on_paste(event: ClipboardEvent) {
			const files = [...(event.clipboardData?.files ?? [])]
			if (!files.length) return
			event.preventDefault()
			this.on_attach_files(files)
		}

		static file_card_uri(name: string): string {
			const ext = name.split('.').pop()?.toUpperCase() ?? ''
			const short = name.length > 20 ? name.slice(0, 17) + '\u2026' : name
			const escaped = short.replace(
				/[<>&"']/g,
				c =>
					(
						({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }) as Record<
							string,
							string
						>
					)[c] ?? c,
			)
			const svg = [
				`<svg xmlns='http://www.w3.org/2000/svg' width='140' height='80'>`,
				`<rect width='140' height='80' rx='8' fill='%23f0f0f0' stroke='%23ddd'/>`,
				`<text x='10' y='35' font-size='11' fill='%23333' font-family='system-ui,sans-serif'>${escaped}</text>`,
				`<rect x='8' y='50' rx='4' width='${ext.length * 8 + 16}' height='20' fill='%23e0e0e0'/>`,
				`<text x='16' y='64' font-size='10' font-weight='bold' fill='%23666' font-family='system-ui,sans-serif'>${ext}</text>`,
				`</svg>`,
			].join('')
			return `data:image/svg+xml,${svg}`
		}
	}
}
