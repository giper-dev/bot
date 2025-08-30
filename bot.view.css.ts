namespace $.$$ {
	
	$mol_style_define( $hd_bot, {
		
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
