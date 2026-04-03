namespace $.$$ {

	type FileItem = {
		name: string
		content: string
	}

	type Request = {
		message: string // текст запроса пользователя
		files: ( string | FileItem )[] // ссылки на приложенные файлы
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
			const responses = this.history().filter( ( _, i ) => i % 2 === 1 ) as Response[]
			return responses[ responses.length - 1 ]?.digest ?? ''
		}
		
		override prompt_text( next?: string ) {
			return this.$.$mol_state_session.value( 'prompt_text', next ) ?? ''
		}
		
		@ $mol_mem
		history( next?: History ): History {
			return this.$.$mol_state_session.value( 'history', next )
				?? $mol_maybe( this.$.$mol_state_arg.value( 'prompt' ) || null ).map( p => ({ message: p, files: [] }) )
		}
		
		override messages() {
			return this.history().map( (_,i)=> this.Message(i) )
		}
		
		@ $mol_mem_key
		override message_text( index: number ): string {
			
			const item = this.history()[ index ]
			let text = item.message

			if( !text ) return ''
			if( '`#>|='.includes( text[0] ) ) text = '\n' + text
			return this.message_name( index ) + ' ' + text

		}

		message_name( index: number ): string {
			return index % 2 ? '🤖' : '🙂'
		}

		@ $mol_mem_key
		override message_attachments( index: number ) {
			const item = this.history()[ index ]
			const views: $mol_view[] = []
			item.files.forEach( ( file, i ) => {
				if( typeof file === 'object' && 'name' in file ) {
					views.push( this.Message_file([ index, i ]) )
				} else if( typeof file === 'string' && file.startsWith( 'data:' ) ) {
					views.push( this.Message_image([ index, i ]) )
				}
			})
			return views
		}

		@ $mol_mem_key
		override message_image_uri( id: [ number, number ] ) {
			const item = this.history()[ id[0] ]
			const file = item.files[ id[1] ]
			return typeof file === 'string' ? file : ''
		}

		@ $mol_mem_key
		override message_content( index: number ) {
			const attachments = this.message_attachments( index )
			return [
				... attachments.length ? [ this.Message_attachments( index ) ] : [],
				this.Message_text( index ),
			]
		}
		
		@ $mol_mem_key
		override message_file_name( [ msg, file ]: [ number, number ] ) {
			const item = this.history()[ msg ]
			const f = item.files[ file ]
			return typeof f === 'object' && 'name' in f ? f.name : ''
		}
		
		@ $mol_mem_key
		override message_file_ext( [ msg, file ]: [ number, number ] ) {
			const item = this.history()[ msg ]
			const f = item.files[ file ]
			if( typeof f !== 'object' || !( 'name' in f ) ) return ''
			return f.name.split( '.' ).pop()?.toUpperCase() ?? ''
		}
		
		@ $mol_mem_key
		override message_file_info( [ msg, file ]: [ number, number ] ) {
			const item = this.history()[ msg ]
			const f = item.files[ file ]
			if( typeof f !== 'object' || !( 'name' in f ) ) return ''
			const lines = f.content.split( '\n' ).length
			return lines + ' lines'
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
		
		@ $mol_mem
		result( next?: string ) {
			return next ?? this.results()[ this.version() ]?.document ?? ''
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
				if( i % 2 ) {
					model.tell([ { messsage: item.message } ])
				} else {
					const files = item.files.map( f =>
						typeof f === 'object' && 'content' in f ? f.content : f
					)
					model.ask([ item.message, ... files ])
				}
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
			if( !this.prompt_text() && !this.attach().length ) return
			const Picture = $mol_wire_sync( this.$.$mol_picture )
			const meta_map = this.file_meta()
			const files: ( string | FileItem )[] = this.attach().map( item => {
				const meta = meta_map.get( item )
				const resp = this.$.$mol_fetch.response( item )
				const mime = resp.mime() ?? meta?.type ?? ''
				if( mime.startsWith( 'image/' ) ) {
					return Picture.fit( item, 512 ).url( 'image/webp' )
				}
				const content = resp.text()
				return { name: meta?.name ?? 'file.txt', content } as FileItem
			})
			this.history([ ... this.history(), { message: this.prompt_text(), files } ])
			this.prompt_text( '' )
			this.attach( [] )
			this.file_meta( new Map() )
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

		@ $mol_mem
		file_meta( next?: Map< string, { name: string, type: string } > ) {
			return next ?? new Map()
		}
		
		@ $mol_action
		on_attach_files( files: readonly File[] ) {
			const meta = new Map( this.file_meta() )
			const urls = files.map( file => {
				const url = URL.createObjectURL( file )
				meta.set( url, { name: file.name, type: file.type } )
				return url
			})
			this.file_meta( meta )
			this.attach([ ... this.attach(), ... urls ])
		}
		
		@ $mol_mem
		override Attach() {
			const obj = super.Attach()

			obj.attach_new = ( files: readonly File[] ) => this.on_attach_files( files )

			const self = this

			obj.content = () => {
				const items = obj.items()
				const views: $mol_view[] = []
				for( let i = 0; i < items.length; ++i ) {
					const meta = self.file_meta().get( items[i] )
					if( meta && !meta.type.startsWith( 'image/' ) ) continue
					views.push( obj.Item( i ) )
				}
				views.push( obj.Add() )
				return views
			}

			return obj
		}
		
		@ $mol_action
		attach_file_remove( index: number ) {
			const urls = this.attach()
			const url = urls[ index ]
			if( !url ) return
			const next = [ ... urls.slice( 0, index ), ... urls.slice( index + 1 ) ]
			this.attach( next )
			const meta = new Map( this.file_meta() )
			meta.delete( url )
			this.file_meta( meta )
		}

		@ $mol_mem
		override attach_preview_items() {
			return this.attach()
				.map( ( url, i ) => {
					const meta = this.file_meta().get( url )
					if( !meta || meta.type.startsWith( 'image/' ) ) return null
					return this.Attach_file( i )
				})
				.filter( Boolean ) as $mol_view[]
		}

		@ $mol_mem_key
		override Attach_file( id: number ) {
			const card = super.Attach_file( id )
			card.click = ( next?: Event ) => {
				if( !next ) return null
				this.attach_file_remove( id )
				return next
			}
			return card
		}
		
		@ $mol_mem_key
		override attach_file_name( index: number ) {
			const url = this.attach()[ index ]
			const meta = this.file_meta().get( url )
			return meta?.name ?? 'file'
		}
		
		@ $mol_mem_key
		override attach_file_ext( index: number ) {
			const url = this.attach()[ index ]
			const meta = this.file_meta().get( url )
			const name = meta?.name ?? ''
			return name.split( '.' ).pop()?.toUpperCase() ?? ''
		}
		
		@ $mol_mem_key
		override attach_file_info( index: number ) {
			const url = this.attach()[ index ]
			const meta = this.file_meta().get( url )
			if( !meta || meta.type.startsWith( 'image/' ) ) return ''
			try {
				const resp = this.$.$mol_fetch.response( url )
				const text = resp.text()
				const lines = text.split( '\n' ).length
				return lines + ' lines'
			} catch {
				return ''
			}
		}
		
		on_paste( event: ClipboardEvent ) {
			const files = [ ... event.clipboardData?.files ?? [] ]
			if( !files.length ) return
			event.preventDefault()
			this.on_attach_files( files )
		}
		
		static file_card_uri( name: string, info = '' ): string {
			const ext = name.split( '.' ).pop()?.toUpperCase() ?? ''
			const short = name.length > 24 ? name.slice( 0, 21 ) + '\u2026' : name
			const escaped = short.replace( /[<>&"']/g, c =>
				({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' } as Record<string,string>)[ c ] ?? c
			)
			const w = 180
			const h = 100
			const svg = [
				`<svg xmlns='http://www.w3.org/2000/svg' width='${ w }' height='${ h }'>`,
				`<rect width='${ w }' height='${ h }' rx='10' fill='%23f5f5f5' stroke='%23e0e0e0'/>`,
				`<text x='14' y='30' font-size='12' font-weight='bold' fill='%23222' font-family='system-ui,sans-serif'>${ escaped }</text>`,
				... info ? [ `<text x='14' y='48' font-size='10' fill='%23999' font-family='system-ui,sans-serif'>${ info }</text>` ] : [],
				`<rect x='12' y='${ h - 28 }' rx='8' width='${ ext.length * 8 + 20 }' height='20' fill='%23e8e8e8'/>`,
				`<text x='22' y='${ h - 14 }' font-size='10' font-weight='bold' fill='%23666' font-family='system-ui,sans-serif'>${ ext }</text>`,
				`</svg>`,
			].join( '' )
			return `data:image/svg+xml,${ svg }`
		}
		
	}
}
