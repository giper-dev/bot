namespace $.$$ {
	
	const { url, linear_gradient, hsla } = $mol_style_func
	
	$mol_style_define( $giper_bot, {
		
		background: {
			size: [ 'cover' ],
			position: 'center',
			image: [
				[ linear_gradient( $mol_theme.spirit ) ],
				[ url( 'giper/bot/logo/back.jpg' ) ],
			]
		},
		
		Dialog: {
			margin: {
				left: 'auto',
				right: 'auto',
			},
			flex: {
				basis: '30rem',
				grow: 1,
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
		
		Result_page: {
			flex: {
				basis: `50rem`,
				grow: 1,
			},
			margin: {
				right: 'auto',
			},
		},
		
		Attach: {
			Item: {
				height: '2.5rem',
			},
			Add: {
				height: '2.5rem',
			},
		},		
		Attach_card: {
			background: {
				color: $mol_theme.card,
			},
			width: '100%',
			height: '100%',
			padding: {
				top: '.15rem',
				bottom: '.15rem',
				left: '.3rem',
				right: '.3rem',
			},
			display: 'flex',
			flex: {
				direction: 'column',
			},
			justify: {
				content: 'space-between',
			},
			overflow: 'hidden',
			border: {
				radius: $mol_gap.round,
			},
		},
		
		Attach_card_name: {
			font: {
				size: '.5rem',
			},
			overflow: 'hidden',
			flex: {
				shrink: 1,
			},
		},
		
		Attach_card_ext: {
			font: {
				size: '.5rem',
				weight: 'bold',
			},
			background: {
				color: $mol_theme.hover,
			},
			padding: {
				top: '.05rem',
				bottom: '.05rem',
				left: '.2rem',
				right: '.2rem',
			},
			borderRadius: '.15rem',
			width: 'fit-content',
			flex: {
				shrink: 0,
			},
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
