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
		
		@ $mol_mem
		history( next?: string[] ) {
			return this.$.$mol_state_session.value( 'history', next ) ?? $mol_maybe( this.$.$mol_state_arg.value( 'prompt' ) || null )
		}
		
		override messages() {
			return this.history().map( (_,i)=> this.Message(i) )
		}
		
		override message_text( index: number ): string {
			return this.message_name( index ) + ' ' + ( this.history()[ index ] ?? '' )
		}
		
		message_name( index: number ): string {
			return index % 2 ? '🤖' : '🙂'
		}
		
		@ $mol_mem
		override rules() {
			return super.rules().replaceAll( '{lang}', this.$.$mol_locale.lang() )
		}
		
		override context() {
			return this.rules() + '\nДалее идёт резюме прошлых обсуждений:\n' + this.digest()
		}
		
		@ $mol_mem
		override communication() {
			
			const history = this.history()
			if( history.length % 2 === 0 ) return
			
			const prompt = history.at(-1)
			const model = this.Model()
			
			const resp = model.shot( prompt )
			
			this.dialog_title( resp.title )
			this.digest( resp.digest )
			this.history([ ... history, resp.response ])
			
		}
		
		override prompt_submit() {
			this.history([ ... this.history(), this.prompt_text() ])
			this.prompt_text( '' )
		}
		
	}
}
