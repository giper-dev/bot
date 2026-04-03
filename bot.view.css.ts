namespace $.$$ {
	
	const { url, linear_gradient } = $mol_style_func
	
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
			Foot: {
				flex: {
					direction: 'column',
				},
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
		
		Message: {
			flex: {
				direction: 'column',
			},
			align: {
				items: 'flex-start',
			},
		},

		Message_attachments: {
			display: 'grid',
			gridTemplateColumns: 'repeat( auto-fill, minmax( 8rem, 1fr ) )',
			gap: $mol_gap.block,
			alignSelf: 'stretch',
		},

		Message_image: {
			width: '100%',
			maxHeight: '12rem',
			overflow: 'hidden',
			objectFit: 'cover',
			border: {
				radius: $mol_gap.round,
			},
		},
		
		Attach: {
			Add: {
				height: '2.5rem',
			},
		},

		Attach_previews: {
			display: 'grid',
			gridTemplateColumns: 'repeat( auto-fill, minmax( 4rem, 1fr ) )',
			gap: $mol_gap.block,
			alignSelf: 'stretch',
		},

		Attach_image: {
			width: '100%',
			height: '5rem',
			objectFit: 'cover',
			cursor: 'pointer',
			border: {
				radius: $mol_gap.round,
			},
			overflow: 'hidden',
		},

		Attach_file: {
			cursor: 'pointer',
			margin: {
				bottom: '1rem',
			},
		},
		
		Prompt_row: {
			gap: '.5rem',
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
