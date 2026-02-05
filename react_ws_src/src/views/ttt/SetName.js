import React, {Component} from 'react'

import { getUser } from '../../helpers/userStorage'

export default class SetName extends Component {

	constructor (props) {
		super(props)

		// Check for returning user
		var storedUser = getUser()
		this.state = {
			initialName: storedUser ? storedUser.name : ''
		}
	}

//	------------------------	------------------------	------------------------

	render () {
		return (
			<div id='SetName'>

				<h1>Set Name</h1>

				<div ref='nameHolder' className='input_holder left'>
					<label>Name </label>
					<input ref='name' type='text' className='input name' placeholder='Name' defaultValue={this.state.initialName} />
				</div>


				<button type='submit' onClick={this.saveName.bind(this)} className='button'><span>SAVE <span className='fa fa-caret-right'></span></span></button>

			</div>
		)
	}

//	------------------------	------------------------	------------------------

	saveName (e) {
		// const { name } = this.refs
		// const { onSetName } = this.props
		// onSetName(name.value.trim())

		this.props.onSetName(this.refs.name.value.trim())
	}

}
