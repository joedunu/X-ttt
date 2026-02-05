import React, { Component } from 'react'

import TweenMax from 'gsap'

export default class Leaderboard extends Component {

	constructor (props) {
		super(props)

		this.state = {
			players: [],
			loading: true,
			error: null
		}
	}

//	------------------------	------------------------	------------------------

	componentDidMount () {
		this.fetchLeaderboard()
		TweenMax.from('#leaderboard', 1, {opacity: 0, y: -50, ease: Power4.easeOut})
	}

//	------------------------	------------------------	------------------------

	fetchLeaderboard () {
		var apiUrl = app.settings.ws_conf.loc.SOCKET__io.u + '/api/leaderboard?limit=10'

		fetch(apiUrl)
			.then(function(response) {
				if (!response.ok) {
					throw new Error('Failed to fetch leaderboard')
				}
				return response.json()
			})
			.then(function(data) {
				this.setState({
					players: data,
					loading: false
				})
			}.bind(this))
			.catch(function(err) {
				this.setState({
					error: err.message,
					loading: false
				})
			}.bind(this))
	}

//	------------------------	------------------------	------------------------

	render () {
		const { players, loading, error } = this.state

		return (
			<div id='leaderboard'>
				<h1>Leaderboard</h1>

				{loading && <div className='loading'>Loading...</div>}

				{error && <div className='error'>Error: {error}</div>}

				{!loading && !error && players.length === 0 && (
					<div className='empty'>No games played yet. Be the first!</div>
				)}

				{!loading && !error && players.length > 0 && (
					<table className='leaderboard-table'>
						<thead>
							<tr>
								<th>Rank</th>
								<th>Player</th>
								<th>Wins</th>
								<th>Losses</th>
								<th>Draws</th>
							</tr>
						</thead>
						<tbody>
							{players.map(function(player, index) {
								return (
									<tr key={player.odid} className={index < 3 ? 'top-' + (index + 1) : ''}>
										<td className='rank'>{index + 1}</td>
										<td className='name'>{player.name}</td>
										<td className='wins'>{player.wins}</td>
										<td className='losses'>{player.losses}</td>
										<td className='draws'>{player.draws}</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				)}

				<button type='button' onClick={this.props.onBack} className='button'>
					<span>Back <span className='fa fa-caret-left'></span></span>
				</button>
			</div>
		)
	}

}
