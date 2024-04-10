import InfiniteList from "./components/InfiniteScroll";
export function PortfolioPage(){
    return(
        <div className="portfolio-box">
      <p>Portfolio</p>
      <InfiniteList />
    </div>
    
    );
}

export default PortfolioPage;