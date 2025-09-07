namespace $.$$ {
	
	const { url, linear_gradient, hsla } = $mol_style_func
	
	$mol_style_define( $gd_bot, {
		
		background: {
			size: [ 'cover' ],
			position: 'center',
			image: [
				[ linear_gradient( $mol_theme.spirit ) ],
				[ url( 'gd/bot/logo/back.jpg' ) ],
			]
		},
		
		Dialog: {
			margin: [ 0, 'auto' ],
			flex: {
				basis: '60rem',
			},
			Body: {
				display: 'flex',
				flex: {
					direction: 'column-reverse',
				},
				align: {
					items: 'stretch',
				},
				padding: $mol_gap.block,
			},
		},
		
		Avatar: {
			padding: $mol_gap.text,
		},
		
		Prompt_text: {
			flex: {
				shrink: 1,
			},
		},
		
		Context: {
			flex: {
				basis: '30rem',
			},
			Body_content: {
				gap: $mol_gap.block,
			},
		}
		
	} )
	
}
