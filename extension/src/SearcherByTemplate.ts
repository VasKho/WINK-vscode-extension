import {ScAddr, ScClient, ScConstruction, ScType} from 'ts-sc-client-ws';
import {createTechnicalWinkId} from "./Utils";
// import {convertOldGwfToNew} from "./Old2NewScgConverter";
// import {convertGwfToScs} from "./Scg2ScsConverterOld";
// import {convertGwfToScs} from "./Scg2ScsConverter";

// const scClient = new ScClient('ws://localhost:8090');

export class SearcherByTemplate {
    scClient: ScClient;

    constructor(client: ScClient) { this.scClient = client; }

    async findByScsTemplate(scsTemplate: string): Promise<string> {
        const structWinkIdtf = createTechnicalWinkId();
        const searchingResults = await this.scClient.templateSearch(scsTemplate);
        const uniqNodes = new Set<number>();
        searchingResults.forEach(e => e.forEachTriple(n => uniqNodes.add(n.value)));

        const structNode = (await this.scClient.resolveKeynodes([{id: structWinkIdtf, type: ScType.NodeStruct}]))[0];
        const construction = new ScConstruction();

        uniqNodes.forEach(node => {
            construction.createEdge(
                ScType.EdgeAccessConstPosPerm,
                structNode,
                new ScAddr(node)
            );
        });

        await this.scClient.createElements(construction);
        return structWinkIdtf;
    }
}
