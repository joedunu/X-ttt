import React, { Component} from 'react'
import { Link } from 'react-router'

import { getUser, getOrCreateUser } from '../../helpers/userStorage'

import SetName from './SetName'
import SetGameType from './SetGameType'
import Leaderboard from './Leaderboard'

import GameMain from './GameMain'

export default class Ttt extends Component {

	constructor (props) {
		super(props)

		// Load existing user from localStorage
		var storedUser = getUser()
		if (storedUser) {
			app.settings.curr_user = {
				name: storedUser.name,
				odid: storedUser.odid
			}
		}

		this.state = {
			game_step: this.set_game_step()
		}
	}

//	------------------------	------------------------	------------------------

	render () {

		const {game_step} = this.state

		console.log(game_step)

		return (
			<section id='TTT_game'>
				<div id='page-container'>
					{game_step == 'set_name' && <SetName 
														onSetName={this.saveUserName.bind(this)} 
												/>}

					{game_step != 'set_name' && 
						<div>
							<h2>Welcome, {app.settings.curr_user.name}</h2>
						</div>
					}

					{game_step == 'set_game_type' && <SetGameType 
																onSetType={this.saveGameType.bind(this)}
																onShowLeaderboard={this.showLeaderboard.bind(this)} 
															/>}
					{game_step == 'leaderboard' && <Leaderboard 
																onBack={this.hideLeaderboard.bind(this)} 
													/>}
					{game_step == 'start_game' && <GameMain 
														game_type={this.state.game_type}
														onEndGame={this.gameEnd.bind(this)} 
													/>}

				</div>
			</section>
		)
	}

//	------------------------	------------------------	------------------------

	saveUserName (n) {
		var user = getOrCreateUser(n)
		app.settings.curr_user = {
			name: user.name,
			odid: user.odid
		}

		this.upd_game_step()
	}

//	------------------------	------------------------	------------------------

	saveGameType (t) {
		this.state.game_type = t

		this.upd_game_step()
	}

//	------------------------	------------------------	------------------------

	gameEnd (t) {
		this.state.game_type = null

		this.upd_game_step()
	}

//	------------------------	------------------------	------------------------

	showLeaderboard () {
		this.setState({
			game_step: 'leaderboard'
		})
	}

//	------------------------	------------------------	------------------------

	hideLeaderboard () {
		this.setState({
			game_step: 'set_game_type'
		})
	}

//	------------------------	------------------------	------------------------
//	------------------------	------------------------	------------------------

	upd_game_step () {

		this.setState({
			game_step: this.set_game_step()
		})
	}

//	------------------------	------------------------	------------------------

	set_game_step () {

		if (!app.settings.curr_user || !app.settings.curr_user.name)
			return 'set_name'
		else if (!this.state || !this.state.game_type)
			return 'set_game_type'
		else
			return 'start_game'
	}

}

//	------------------------	------------------------	------------------------

Ttt.propTypes = {
	params: React.PropTypes.any
}

Ttt.contextTypes = {
  router: React.PropTypes.object.isRequired
}