const axios = require('axios').default;
const path = require('path');
const fs = require('fs');
const jwt = require("jsonwebtoken");
const { setTimeout } = require('timers');
const errors = require('./../structs/errors');
const { ErrDef, ApiException } = require('./../structs/errors');
var builder = require('xmlbuilder');
const Express = require('express');

Date.prototype.addHours = function (h) {
	this.setTime(this.getTime() + (h * 60 * 60 * 1000));
	return this;
}
/**
 * 
 * @param {Express.Application} app 
 */
module.exports = (app) => {
	//lightswitch
	app.get('/lightswitch/api/service/bulk/status', (req, res) => {
		//adds serviceId based on what the game feeds it, if undefined defaults to fortnite
		const serviceId = req.query.serviceId ? req.query.serviceId.toLowerCase() : "fortnite";
		res.json([
			{
				"serviceInstanceId": serviceId,
				"status": "UP",
				"message": "Hi",
				"maintenanceUri": "https://dsc.gg/neonite",
				"allowedActions": [],
				"banned": false,
				"launcherInfoDTO": {
					"appName": "Fortnite",
					"catalogItemId": "4fe75bbc5a674f4f9b356b5c90567da5",
					"namespace": "fn"
				}
			}
		]);
	});

	app.get("/lightswitch/api/service/:serviceId/status", (req, res) => {
		const serviceId = req.params.serviceId ? req.params.serviceId.toLowerCase() : "fortnite";
		res.json({
			"serviceInstanceId": serviceId,
			"status": "UP",
			"message": "Hello",
			"maintenanceUri": "https://dsc.gg/neonite",
			"allowedActions": [],
			"banned": false,
			"launcherInfoDTO": {
			  "appName": "Fortnite",
			  "catalogItemId": "4fe75bbc5a674f4f9b356b5c90567da5",
			  "namespace": "fn"
			}
		  })
	})


	// empty json endpoint if needed
	app.all("/api/json", (req, res) => res.json({}));

	//external auth
	app.get('/account/api/public/account/:accountId/externalAuths', (req, res) => {
		res.json([])
	});


	app.get("/launcher/api/public/assets/:platform/:catalogItemId/:appName", async (req, res) => {
		const token = (await axios.post("https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token", "grant_type=client_credentials", { headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: "Basic M2Y2OWU1NmM3NjQ5NDkyYzhjYzI5ZjFhZjA4YThhMTI6YjUxZWU5Y2IxMjIzNGY1MGE2OWVmYTY3ZWY1MzgxMmU=" } })).data.access_token;

		axios.get("https://launcher-public-service-prod06.ol.epicgames.com" + req.url, {
			headers: {
				authorization: "bearer " + token
			}
		}).then(response => {
			res.json(response.data)
		}).catch(lul => {
			res.json({
				"appName": req.query.appName,
				"labelName": req.headers['user-agent'].split(" ")[0] || req.headers['user-agent'],
				"buildVersion": req.headers['user-agent'].split(" ")[0] || req.headers['user-agent'],
				"catalogItemId": req.params.catalogItemId,
				"expires": new Date().addHours(2),
				"items": { "MANIFEST": { "signature": "ak_token=exp=1619828899~hmac=1968bf14793626dc350d50e03ae92004cff698dcb8276688e175f394b8b8f268", "distribution": "https://epicgames-download1.akamaized.net/", "path": "Builds/Fortnite/Content/CloudDir/9rt_NKT5rwdY4PthEU24o6SUQYYdfA.manifest", "hash": "2817e928c4e0cdce735e8328e37d6fd5338134df", "additionalDistributions": [] }, "CHUNKS": { "signature": "ak_token=exp=1619828899~hmac=1968bf14793626dc350d50e03ae92004cff698dcb8276688e175f394b8b8f268", "distribution": "https://epicgames-download1.akamaized.net/", "path": "Builds/Fortnite/Content/CloudDir/9rt_NKT5rwdY4PthEU24o6SUQYYdfA.manifest", "additionalDistributions": [] } },
				"assetId": "FortniteContentBuilds"
			})
		})
	})

	app.get("/launcher/api/public/distributionpoints/", (req, res) => {
		res.json(
			{
				"distributions": [
					"https://download.epicgames.com/",
					"https://download2.epicgames.com/",
					"https://download3.epicgames.com/",
					"https://download4.epicgames.com/",
					"https://epicgames-download1.akamaized.net/",
					"https://fastly-download.epicgames.com/"
				]
			})
	})

	app.post("/api/v1/user/setting", (req, res) => {
		res.json([
			{
				"accountId": req.body.accountId,
				"key": "avatar",
				"value": "cid_003_athena_commando_f_default"
			},
			{
				"accountId": req.body.accountId,
				"key": "avatarBackground",
				"value": "[\"#B4F2FE\",\"#00ACF2\",\"#005679\"]"
			},
			{
				"accountId": req.body.accountId,
				"key": "appInstalled",
				"value": "init"
			}])
	})

	app.delete("/friends/api/v1/:accountId/friends/NeoniteBot", (req, res) => {
		res.status(403).json({ "errorCode": "errors.com.epicgames.Neonite.common.forbidden", "errorMessage": "You cannot remove the bot", "messageVars": [], "numericErrorCode": 14004, "originatingService": "party", "intent": "prod" })
		var client = global.xmppClients.find(x => x.accountId == req.params.accountId);
		if (!client) return;

		client.functions.SendMessage(JSON.stringify({
			"type": "FRIENDSHIP_REQUEST",
			"timestamp": new Date(),
			"from": "NeoniteBot",
			"to": req.params.accountId,
			"status": "ACCEPTED"
		}))

		client.functions.SendMessage(JSON.stringify({
			"payload": {
				"accountId": "NeoniteBot",
				"status": "ACCEPTED",
				"direction": "INBOUND",
				"created": new Date(),
				"favorite": false
			},
			"type": "com.epicgames.friends.core.apiobjects.Friend",
			"timestamp": new Date()
		}))
	})


	app.get('/api/v1/assets/Fortnite/:version/', (req, res) => {
		res.json([])
	});

	app.get("/fortnite/api/game/v2/world/info", (req, res) => res.json({}))

	app.get("/friends/api/v1/*/blocklist", (req, res) => { res.json([]) })

	app.get("/eulatracking/api/public/agreements/fn/account/*", (req, res) => { res.status(204).end() })

	app.get("/friends/api/v1/*/recent/fortnite", (req, res) => { res.json([]) })

	app.get("/api/v1/events/:game/download/:accountId", (req, res) => {
		res.json({
			"player": {
				"gameId": req.params.game,
				"accountId": req.params.accountId,
				"tokens": [],
				"teams": {},
				"pendingPayouts": [],
				"pendingPenalties": {},
				"persistentScores": {},
				"groupIdentity": {}
			},
			"events": [],
			"templates": [],
			"scores": []
		})
	})

	app.get("/fortnite/api/game/v2/br-inventory/account/:accountId", (req, res) => {
		res.json({
			"stash": {
				"globalcash": 0
			}
		})
	})


	app.get("/catalog/api/shared/bulk/offers", (req, res) => { res.json({}) })

	app.get('/friends/api/v1/:accountId/summary', (req, res) => {
		res.json({
			"friends": [{
				"accountId": "NeoniteBot",
				"groups": [],
				"mutual": 0,
				"alias": "",
				"note": "",
				"favorite": true,
				"created": "2021-01-17T16:42:04.125Z"
			}],
			"incoming": [],
			"suggested": [],
			"blocklist": [],
			"settings": {
				"acceptInvites": "public"
			},
			"limitsReached": {
				"incoming": false,
				"outgoing": false,
				"accepted": false
			}
		})
	})


	//version check
	app.get('/fortnite/api/v2/versioncheck/:version', (req, res) => {
		res.json({ "type": "NO_UPDATE" })
	});

	//privacy
	app.get('/fortnite/api/game/v2/privacy/account/:accountId', (req, res) => {
		res.json({
			"accountId": req.params.accountId,
			"optOutOfPublicLeaderboards": false
		})
	});

	app.post('/api/v1/assets/Fortnite/:version/:netcl', (req, res) => {
		res.json({
			"FortPlaylistAthena": {
				"meta": {
					"promotion": 0
				},
				"assets": {}
			}
		})
	});

	app.post("/friends/api/v1/:accountId/blocklist/NeoniteBot", (req, res) => {
		res.status(403).json({ "errorCode": "errors.com.epicgames.Neonite.common.forbidden", "errorMessage": "You cannot remove the bot", "messageVars": [], "numericErrorCode": 14004, "originatingService": "party", "intent": "prod" })

		var client = global.xmppClients.find(x => x.accountId == req.params.accountId);
		if (!client) return;

		client.functions.SendMessage(JSON.stringify({
			"type": "FRIENDSHIP_REQUEST",
			"timestamp": new Date(),
			"from": "NeoniteBot",
			"to": req.params.accountId,
			"status": "ACCEPTED"
		}))

		client.functions.SendMessage(JSON.stringify({
			"payload": {
				"accountId": "NeoniteBot",
				"status": "ACCEPTED",
				"direction": "INBOUND",
				"created": new Date(),
				"favorite": false
			},
			"type": "com.epicgames.friends.core.apiobjects.Friend",
			"timestamp": new Date()
		}))


	})

	app.get("/account/api/public/account/displayName/:displayName", (req, res) => {
		res.json({
			"id": req.params.displayName,
			"displayName": req.params.displayName,
			"externalAuths": {}
		})

		if (req.params.displayName != "NeoniteBot") return;

		var token = req.headers.authorization.replace("bearer ", "").replace("Bearer ", "")
		var client = global.xmppClients.find(x => x.token == token);

		if (!client) return;

		client.functions.SendMessage(JSON.stringify({
			"type": "FRIENDSHIP_REQUEST",
			"timestamp": new Date(),
			"from": "NeoniteBot",
			"to": req.params.accountId,
			"status": "ACCEPTED"
		}))

		client.functions.SendMessage(JSON.stringify({
			"payload": {
				"accountId": "NeoniteBot",
				"status": "ACCEPTED",
				"direction": "INBOUND",
				"created": new Date(),
				"favorite": false
			},
			"type": "com.epicgames.friends.core.apiobjects.Friend",
			"timestamp": new Date()
		}))
	})

	app.post("/friends/api/v1/:accountId/friends/NeoniteBot", (req, res) => {
		res.status(204).send()
	})

	app.all("/fortnite/api/game/v2/matchmakingservice/ticket/player/:accountId", (req, res) => {
		res.status(204).end()
	})

	//waiting room
	app.get('/waitingroom/api/waitingroom', (req, res) => {
		res.status(204).end();
	});

	//grant access
	app.post('/fortnite/api/game/v2/grant_access/:accountId', (req, res) => {
		res.status(204).end();
	});

	//enabled features
	app.get('/fortnite/api/game/v2/enabled_features', (req, res) => {
		res.json([])
	});

	//receipt
	app.get('/fortnite/api/receipts/v1/account/:accountId/receipts', (req, res) => {
		res.json([])
	});

	//blocklist
	app.get('/friends/api/public/blocklist/:accountId', (req, res) => {
		res.json({
			blockedUsers: []
		})
	});

	//friends setting
	app.get('/friends/api/v1/:accountId/settings', (req, res) => {
		res.json({
			acceptInvites: "public"
		})
	});

	//recent players
	app.get('/friends/api/public/list/fortnite/:accountId/recentPlayers', (req, res) => {
		res.json([]);
	});

	//friends list
	app.get('/friends/api/public/friends/:accountId', (req, res) => {
		res.json([
			{
				accountId: 'NeoniteBot',
				status: 'ACCEPTED',
				direction: 'INBOUND',
				created: '2018-12-06T04:46:01.296Z',
				favorite: false
			},
			{
				accountId: req.params.accountId,
				status: 'ACCEPTED',
				direction: 'INBOUND',
				created: '2018-12-06T04:46:01.296Z',
				favorite: false
			}
		]);
	});

	//datarouter
	app.post('/datarouter/api/v1/public/*', (req, res) => {
		res.status(204).end();
	});

	//presence ?
	app.get('/presence/api/v1/_/:accountId/settings/subscriptions', (req, res) => { res.status(204).end(); });
	app.get('/party/api/v1/Fortnite/user/:accountId/notifications/undelivered/count', (req, res) => { res.status(204).end(); });

	app.get('/socialban/api/public/v1/:accountId', (req, res) => {
		res.status(204).end();
	});

	app.get('/content-controls/:accountId', function (req, res) {
		res.status(204).end();
	});

	//platform
	app.post('/fortnite/api/game/v2/tryPlayOnPlatform/account/:accountId', (req, res) => {
		res.set('Content-Type', 'text/plain');
		res.send(true);
	});

	//sac
	app.get('/affiliate/api/public/affiliates/slug/:affiliateName', (req, res) => {
		res.json({
			id: "aabbccddeeff11223344556677889900",
			slug: req.params.affiliateName,
			displayName: req.params.affiliateName,
			status: "ACTIVE",
			verified: true
		})
	});

	app.get('/content-controls/edecf7a882494f5e9ca9c6b61d9181cf', (req, res) => {
		res.status(404);
		res.json({
			"errorCode": "errors.com.epicgames.content_controls.errors.com.epicgames.content_controls.no_user_config_found",
			"message": "No user found with provided principal id"
		})
	});

	app.get('/statsproxy/api/statsv2/account/:accountId', (req, res) => {
		res.json({
			"startTime": 0,
			"endTime": 9223372036854775807,
			"stats": {},
			"accountId": req.params.accountId
		})
	})

	app.get('/fortnite/api/cloudstorage/system/DefaultGame.ini', (req, res) => {
		res.setHeader("content-type", "application/octet-stream")
		res.sendFile(path.join(__dirname, '../hotfixes/DefaultGame.ini'));
	});

	app.get('/fortnite/api/cloudstorage/user/:accountId', (req, res) => {
		res.json([])
	});

	app.put('/fortnite/api/cloudstorage/user/:accountId/:filename', (req, res) => res.status(204).end())

	app.post("/fortnite/api/game/v2/profileToken/verify/*", (req, res) => { res.status(204).end() })

	//keychain
	app.get('/fortnite/api/storefront/v2/keychain', (req, res) => {
		axios.get("https://api.nitestats.com/v1/epic/keychain", { timeout: 3000 }).then(response => {
			res.json(response.data);
		}).catch(e => {
			res.json(["74AF07F9A2908BB2C32C9B07BC998560:V0Oqo/JGdPq3K1fX3JQRzwjCQMK7bV4QoyqQQFsIf0k=:Glider_ID_158_Hairy"])
		})
	})

	//sigh
	app.get("/fortnite/api/matchmaking/session/findPlayer/:id", (req, res) => {
		res.json([])
	})

	app.get("/fortnite/api/statsv2/account/:accountId", (req, res) => {
		//todo
		res.json([])
	})

};
