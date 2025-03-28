import { commandOptions, createClient } from "redis";
import { copyFinalDist, downloadS3Folder } from "./aws";
import { buildProject } from "./build";

const subscriber = createClient();
subscriber.connect();

const publisher = createClient();
publisher.connect();

async function main() {
    while(1){
        const response = await subscriber.brPop(commandOptions({
            isolated: true
        }),
         'blind-queue',
         0
     );
     //@ts-ignore
     const id = response.element;
     await downloadS3Folder(`output/${id}`);
     await buildProject(id);
     copyFinalDist(id);
     publisher.hSet('status', id, 'deployed')
    }
}

main();