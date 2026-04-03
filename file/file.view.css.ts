namespace $.$$ {
	
	$mol_style_define( $giper_bot_file, {
		
		width: 'auto',
		height: 'auto',
		background: {
			color: $mol_theme.card,
		},
		padding: {
			top: '.5rem',
			bottom: '.5rem',
			left: '.75rem',
			right: '.75rem',
		},
		flex: {
			direction: 'column',
		},
		justify: {
			content: 'space-between',
		},
		gap: '.25rem',
		overflow: 'hidden',
		border: {
			radius: $mol_gap.round,
		},
		
		Name: {
			font: {
				weight: 'bold',
				size: '.875rem',
			},
			overflow: 'hidden',
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
		},
		
		Info: {
			color: $mol_theme.shade,
			font: {
				size: '.75rem',
			},
		},
		
		Ext: {
			font: {
				size: '.625rem',
				weight: 'bold',
			},
			color: $mol_theme.shade,
			background: {
				color: $mol_theme.hover,
			},
			padding: {
				top: '.15rem',
				bottom: '.15rem',
				left: '.4rem',
				right: '.4rem',
			},
			borderRadius: '.5rem',
			width: 'fit-content',
		},
		
	} )
	
}
