export async function sleep(ms: number) {
    /**
     * Avoid sleeps at all costs, this is a last resort!
     */
    return new Promise(resolve => setTimeout(resolve, ms));
}
