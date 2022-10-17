import * as assert from "assert";
import * as fs from "fs";
import * as url from "url";
import { Masterchat, stringify as MSStringify } from "masterchat";
import { WebSocket, WebSocketServer } from "ws";

interface Config {
    Port: number,
    Simplified: boolean
}

const currentDir = url.fileURLToPath(new URL('.', import.meta.url));
var config: Config;
const configPath = currentDir + "/config.json";

try {
    config = JSON.parse(fs.readFileSync(configPath).toString());
    assert.ok(config.Port > 0 && config.Port <= 65536);
    console.log("Using config: Port: " + config.Port.toString() + ", Simplified: " + config.Simplified);
}
catch (error) {
    console.log(error.message);
    console.log("Continuing with Defaults:\nPort: 10101, Simplified: false");
    config = {Port: 10101, Simplified: false};
    if (!fs.existsSync(configPath)){
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
    }
}

const wss = new WebSocketServer({port: config.Port});
var livestream: Masterchat;

wss.on("connection", (ws) => {
    ws.send("#000000\nConnected to websocket.");
    ws.on("message", async (data) => {
        if (livestream != undefined){
            livestream.stop()
        }
        var dataString: string = data.toString();

        if (dataString.toLowerCase().startsWith("connect")){
            var livestreamId: string = dataString.split(' ')[1];
            try{
                livestream = await Masterchat.init(livestreamId);
            }
            catch (error){
                ws.send(`#000000\nCouldn't connect to ${livestreamId}. ${error.message}`);
            }
            ws.send(`#000000\n<color=orange>CONNECTED ${livestream.metadata.channelName}</color>`);
            livestream.listen();

            livestream.on("actions", (actions) => {
                actions.forEach(action => {
                    if(config.Simplified){
                        switch (action.type) {
                            case "addChatItemAction":
                                let username: string = "";
                                if (action.membership?.status != undefined){
                                    username = `<color=green>${action.authorName}</color>`;
                                }
                                else {
                                    username = action.authorName!;
                                }
                                if (action.isModerator){ username = `<color=#5480EE>${action.authorName}</color>`; }
                                if (action.isOwner){ username = `<color=yellow>${action.authorName}</color>`; }
                                ws.send(`#606060\n<b>${username}</b>: ${MSStringify(action.message!)}`);
                                break;
                            case "addSuperChatItemAction":
                                ws.send(
                                    `${colourNameToHex(action.color)}\n${action.authorName} superchatted ${action.amount.toString()} ${action.currency}${action.message == null ? "." : (" with the message: " + MSStringify(action.message!))}`
                                );
                                break;
                            case "addMembershipItemAction":
                                var stringBuilder = `${action.authorName} just subscribed`;
                                if (action.level != undefined) {stringBuilder += ` to the ${action.level} tier.`;}
                                ws.send(`#006000\n${stringBuilder}`);
                                break;
                            case "addMembershipMilestoneItemAction":
                                var stringBuilder = "";
                                stringBuilder += (action.level != undefined ? ` to the ${action.level} tier: ` : `: `);
                                ws.send(`#006000\n${action.authorName} has been subscribed for ${action.durationText}${stringBuilder}${MSStringify(action.message!)}`);
                                break;
                            default:
                                break;
                        }
                    }
                    else{
                        ws.send(JSON.stringify(action));
                    }
                    
                });
            });
        }
        else if (dataString == "disconnect"){
            if (livestream != undefined){
                ws.send(`#000000\n<color=#FF4444>Disconnected from ${livestream.metadata.channelName}</color>`);
                livestream.stop();
            }
        }

    });

});

function colourNameToHex(colourName: string) {
    const colourToHex = {
        "blue":"#141D40",
        "lightblue":"#202F66",
        "green":"#202F66",
        "yellow":"#B8B800",
        "orange":"#FF7F00",
        "magenta":"#600060",
        "red":"#600000"
    };

    return colourToHex[colourName];
}