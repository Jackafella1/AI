class Crawler {
    private seen = new Set<string>();
    private pages: Page[] = [];
    private queue: { url: string; depth: number }[] = [];
  
    constructor(private maxDepth = 2, private maxPages = 1) {}
  
    async crawl(startUrl: string): Promise<Page[]> {
      // Add the start URL to the queue
      this.addToQueue(startUrl);
  
      // While there are URLs in the queue and we haven't reached the maximum number of pages...
      while (this.shouldContinueCrawling()) {
        // Dequeue the next URL and depth
        const { url, depth } = this.queue.shift()!;
  
        // If the depth is too great or we've already seen this URL, skip it
        if (this.isTooDeep(depth) || this.isAlreadySeen(url)) continue;
  
        // Add the URL to the set of seen URLs
        this.seen.add(url);
  
        // Fetch the page HTML
        const html = await this.fetchPage(url);
  
        // Parse the HTML and add the page to the list of crawled pages
        this.pages.push({ url, content: this.parseHtml(html) });
  
        // Extract new URLs from the page HTML and add them to the queue
        this.addNewUrlsToQueue(this.extractUrls(html, url), depth);
      }
  
      // Return the list of crawled pages
      return this.pages;
    }
  
    // ... Some private methods removed for brevity
  
    private async fetchPage(url: string): Promise<string> {
      try {
        const response = await fetch(url);
        return await response.text();
      } catch (error) {
        console.error(`Failed to fetch ${url}: ${error}`);
        return "";
      }
    }
  
    private parseHtml(html: string): string {
      const $ = cheerio.load(html);
      $("a").removeAttr("href");
      return NodeHtmlMarkdown.translate($.html());
    }
  
    private extractUrls(html: string, baseUrl: string): string[] {
      const $ = cheerio.load(html);
      const relativeUrls = $("a")
        .map((_, link) => $(link).attr("href"))
        .get() as string[];
      return relativeUrls.map(
        (relativeUrl) => new URL(relativeUrl, baseUrl).href
      );
    }
  }