namespace $.$$ {
	
	type Request = {
		message: string // текст запроса пользователя
		files: string[] // ссылки на приложенные файлы
	}
	
	type Response = {
		message: string // ответ в свободной форме
		files: string[] // ссылки на файлы для скачивания
		document: string | null // обновление документа в формате markdown
		confidence: number // степень уверенности в ответе от 0 до 1
		digest: string // краткий пересказ всего обсуждения
		title: string // ёмкий заголовок всего обсуждения
	}
	
	type History = readonly ( Request | Response )[]
	
	export class $giper_bot extends $.$giper_bot {
		
		@ $mol_mem
		override pages() {
			return [
				this.Space(),
				this.Dialog(),
				... this.result() ? [ this.Result_page( this.version() ) ] : [],
			]
		}
		
		result_item() {
			return this.results()[ this.version() ] as Response | undefined
		}
		
		override result_title() {
			return this.result_item()?.title ?? super.result_title()
		}
		
		override digest() {
			return this.result_item()?.digest ?? ''
		}
		
		override prompt_text( next?: string ) {
			return this.$.$mol_state_session.value( 'prompt_text', next ) ?? ''
		}
		
		@ $mol_mem
		history( next?: History ) {
			return this.$.$mol_state_session.value( 'history', next ) ?? $mol_maybe( this.$.$mol_state_arg.value( 'prompt' ) || null ).map( p => [p] )
		}
		
		override messages() {
			return this.history().map( (_,i)=> this.Message(i) )
		}
		
		@ $mol_mem_key
		override message_text( index: number ): string {
			
			const item = this.history()[ index ]
			let text = [ item.message, ... item.files.map( item => `""` + item + `""` ) ].join( '\n' )
			
			if( '`#>|='.includes( text[0] ) ) text = '\n' + text // markdown blocks
			return this.message_name( index ) + ' ' + text
			
		}
		
		message_name( index: number ): string {
			return index % 2 ? '🤖' : '🙂'
		}
		
		@ $mol_mem
		results() {
			return this.history().filter( item => 'document' in item && item.document ) as Response[]
		}
		
		@ $mol_mem
		version( next?: number ) {
			const count = this.results().length
			if( next && next < 0 ) next = 0
			if( next && next >= count ) next = count - 1
			return Math.max( 0, next ?? count - 1 )
		}
		
		result() {
			return this.results()[ this.version() ]?.document ?? ''
		}
		
		@ $mol_mem
		override rules() {
			return super.rules()
				.replaceAll( '{lang}', this.$.$mol_locale.lang() )
				// .replaceAll( '{document}', this.result().replaceAll( /^/gm, '\t' ) )
		}
		
		override context() {
			return this.rules()
		}
		
		@ $mol_mem
		override communication() {
			
			const history = this.history()
			if( history.length % 2 === 0 ) return
			
			const model = this.Model().fork()
			for( let i = 0; i < history.length; ++i ) {
				const item = history[i]
				if( i % 2 ) model.tell([ { messsage: item.message } ])
				else model.ask([ item.message, ... item.files ])
			}
			
			try {
				const resp = model.response()
				this.history([ ... history, resp ])
			} catch( error: any ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				if( $mol_fail_log( error ) ) {
					this.history([ ... history, { message: '📛' + error.message, files: [] } ])
				}
			}
			
		}
		
		@ $mol_action
		override prompt_submit() {
			if( !this.prompt_text() && !this.attach() ) return
			const Picture = $mol_wire_sync( this.$.$mol_picture )
			const files = this.attach().map( item =>
				Picture.fit( item, 512 ).url( 'image/webp' )
			)
			this.history([ ... this.history(), { message: this.prompt_text(), files } ])
			this.prompt_text( '' )
			this.attach( [] )
		}
		
		override reset() {
			this.history( [] )
		}
		
		override quote_start() {
			this.quote( $mol_dom.document.getSelection()?.toString() ?? '' )
		}
		
		override quote_end() {
			
			let quote = this.quote().trim()
			if( !quote ) return
			
			const [ from, to ] = this.Prompt_text().Edit().selection()
			if( from !== to ) return
			
			let text = this.prompt_text()
			if( to < text.length - 1 ) return
			
			text = ( text ? text + '\n' : '' ) + quote.replaceAll( /^/mg, '> ' ) + '\n'
			
			this.prompt_text( text )
			this.Prompt_text().Edit().selection([ text.length, text.length ])
			
		}
		
	}
}
