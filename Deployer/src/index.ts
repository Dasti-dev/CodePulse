import { createClient } from 'redis';
import { downloadS3Folder } from './aws';
import { buildProject } from './utils'
import { copyFinalDist } from './aws';

const subscriber = createClient();
subscriber.connect();

const publisher = createClient();
publisher.connect();

async function main() {
    while(1) {
        const response = await subscriber.brPop(
            commandOptions({ isolated:true }),
            'key',
            0
        );
        // @ts-ignore
        const id = response.element;
        await downloadS3Folder(`/output/${id}`);
        await buildProject(id);
        await copyFinalDist(id);

        publisher.hSet("status", id, "deployed")
    }
}

main();

function commandOptions(arg0: { isolated: boolean; }): any {
    throw new Error('Function not implemented.');
}
