namespace $.$$ {
	export class $hd_bot extends $.$hd_bot {
		
		override dialog_title( next?: string ) {
			return this.$.$mol_state_session.value( 'title', next ) ?? super.dialog_title()
		}
		
		override digest( next?: string ) {
			return this.$.$mol_state_session.value( 'digest', next ) ?? ''
		}
		
		override prompt_text( next?: string ) {
			return this.$.$mol_state_session.value( 'prompt_text', next ) ?? ''
		}
		
		history( next?: string[] ) {
			return this.$.$mol_state_session.value( 'history', next ) ?? []
		}
		
		override messages() {
			return this.history().map( (_,i)=> this.Message(i) )
		}
		
		override message_text( index: number ): string {
			return this.message_name( index ) + ' ' + ( this.history()[ index ] ?? '' )
		}
		
		override message_name( index: number ): string {
			return index % 2 ? '🤖' : '🙂'
		}
		
		override context() {
			return this.rules() + '\nДалее идёт резюме прошлых обсуждений:\n' + this.digest()
		}
		
		override model_response() {
			return this.Model().response()
		}
		
		override prompt_submit() {
			
			this.history([ ... this.history(), this.prompt_text() ])
			const resp = this.Model().ask( this.prompt_text() ).response()
			
			this.dialog_title( resp.title )
			this.digest( resp.digest )
			this.history([ ... this.history(), resp.response ])
			
			this.Model().history([])
			this.prompt_text( '' )
			
		}
		
	}
}
