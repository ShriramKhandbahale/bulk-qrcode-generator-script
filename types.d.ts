export interface Config {
    startId: number;
    endId: number;
    prefix: string;
    padLength: number;
    qrSize: number;
    columns: number;
    rows: number;
    margin: number;
    textMargin: number;
    fontSize: number;
    outputFile: string;
    showGridLines: boolean;
    gridLineWidth: number;
    gridLineColor: string;
}