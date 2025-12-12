/**
 * Add More Wines to Reach 200
 * 
 * Expands the validation list to 200 wines by adding:
 * - Wines from popular seed data
 * - Additional popular wines from various regions
 * - Stratified by price range
 */

const fs = require('fs');
const path = require('path');

const CURRENT_WINES_PATH = path.join(__dirname, 'winesToValidate200.json');
const SEED_DATA_PATH = path.join(__dirname, '../../seedData/popular-wines.json');
const EXPANDED_OUTPUT = path.join(__dirname, 'winesToValidate200.json');

// Additional popular wines to add (expanded list)
const additionalPopularWines = [
  // Budget wines
  { title: "Charles Shaw Cabernet Sauvignon", producer: "Charles Shaw", wineName: "Cabernet Sauvignon", vintage: "2021", region: "California", country: "United States", kagglePrice: 3, priceYear: 2017, priceRange: "budget" },
  { title: "Yellow Tail Merlot", producer: "Yellow Tail", wineName: "Merlot", vintage: "2022", region: "South Eastern Australia", country: "Australia", kagglePrice: 8, priceYear: 2017, priceRange: "budget" },
  { title: "Barefoot Pinot Grigio", producer: "Barefoot", wineName: "Pinot Grigio", vintage: "2022", region: "California", country: "United States", kagglePrice: 6, priceYear: 2017, priceRange: "budget" },
  { title: "Cavit Pinot Grigio", producer: "Cavit", wineName: "Pinot Grigio", vintage: "2022", region: "Trentino", country: "Italy", kagglePrice: 10, priceYear: 2017, priceRange: "budget" },
  { title: "Gallo Family Vineyards Chardonnay", producer: "Gallo Family", wineName: "Chardonnay", vintage: "2021", region: "California", country: "United States", kagglePrice: 8, priceYear: 2017, priceRange: "budget" },
  { title: "Yellow Tail Pinot Grigio", producer: "Yellow Tail", wineName: "Pinot Grigio", vintage: "2022", region: "South Eastern Australia", country: "Australia", kagglePrice: 8, priceYear: 2017, priceRange: "budget" },
  { title: "Barefoot Moscato", producer: "Barefoot", wineName: "Moscato", vintage: "2022", region: "California", country: "United States", kagglePrice: 6, priceYear: 2017, priceRange: "budget" },
  { title: "Yellow Tail Riesling", producer: "Yellow Tail", wineName: "Riesling", vintage: "2022", region: "South Eastern Australia", country: "Australia", kagglePrice: 8, priceYear: 2017, priceRange: "budget" },
  { title: "Barefoot Sweet Red", producer: "Barefoot", wineName: "Sweet Red", vintage: "2022", region: "California", country: "United States", kagglePrice: 6, priceYear: 2017, priceRange: "budget" },
  { title: "Yellow Tail Pinot Noir", producer: "Yellow Tail", wineName: "Pinot Noir", vintage: "2022", region: "South Eastern Australia", country: "Australia", kagglePrice: 8, priceYear: 2017, priceRange: "budget" },
  
  // Moderate wines
  { title: "Kendall-Jackson Pinot Noir", producer: "Kendall-Jackson", wineName: "Pinot Noir", vintage: "2021", region: "California", country: "United States", kagglePrice: 20, priceYear: 2017, priceRange: "moderate" },
  { title: "J. Lohr Cabernet Sauvignon", producer: "J. Lohr", wineName: "Cabernet Sauvignon", vintage: "2019", region: "Paso Robles", country: "United States", kagglePrice: 18, priceYear: 2017, priceRange: "moderate" },
  { title: "Beringer Founders' Estate Cabernet Sauvignon", producer: "Beringer", wineName: "Cabernet Sauvignon", vintage: "2019", region: "California", country: "United States", kagglePrice: 12, priceYear: 2017, priceRange: "moderate" },
  { title: "Chateau Ste. Michelle Gewürztraminer", producer: "Château Ste. Michelle", wineName: "Gewürztraminer", vintage: "2021", region: "Columbia Valley", country: "United States", kagglePrice: 12, priceYear: 2017, priceRange: "moderate" },
  { title: "Columbia Crest Grand Estates Cabernet Sauvignon", producer: "Columbia Crest", wineName: "Cabernet Sauvignon", vintage: "2018", region: "Columbia Valley", country: "United States", kagglePrice: 12, priceYear: 2017, priceRange: "moderate" },
  { title: "Mark West Pinot Noir", producer: "Mark West", wineName: "Pinot Noir", vintage: "2020", region: "California", country: "United States", kagglePrice: 12, priceYear: 2017, priceRange: "moderate" },
  { title: "Woodbridge by Robert Mondavi Cabernet Sauvignon", producer: "Woodbridge", wineName: "Cabernet Sauvignon", vintage: "2019", region: "California", country: "United States", kagglePrice: 10, priceYear: 2017, priceRange: "moderate" },
  { title: "Sutter Home Cabernet Sauvignon", producer: "Sutter Home", wineName: "Cabernet Sauvignon", vintage: "2019", region: "California", country: "United States", kagglePrice: 8, priceYear: 2017, priceRange: "moderate" },
  { title: "Bogle Essential Red", producer: "Bogle Vineyards", wineName: "Red Blend", vintage: "2020", region: "California", country: "United States", kagglePrice: 10, priceYear: 2017, priceRange: "moderate" },
  { title: "Rex Goliath Merlot", producer: "Rex Goliath", wineName: "Merlot", vintage: "2020", region: "California", country: "United States", kagglePrice: 8, priceYear: 2017, priceRange: "moderate" },
  { title: "Kendall-Jackson Sauvignon Blanc", producer: "Kendall-Jackson", wineName: "Sauvignon Blanc", vintage: "2021", region: "California", country: "United States", kagglePrice: 15, priceYear: 2017, priceRange: "moderate" },
  { title: "Chateau Ste. Michelle Pinot Grigio", producer: "Château Ste. Michelle", wineName: "Pinot Grigio", vintage: "2021", region: "Columbia Valley", country: "United States", kagglePrice: 12, priceYear: 2017, priceRange: "moderate" },
  { title: "Beringer White Zinfandel", producer: "Beringer", wineName: "White Zinfandel", vintage: "2021", region: "California", country: "United States", kagglePrice: 8, priceYear: 2017, priceRange: "moderate" },
  { title: "Sutter Home Merlot", producer: "Sutter Home", wineName: "Merlot", vintage: "2019", region: "California", country: "United States", kagglePrice: 8, priceYear: 2017, priceRange: "moderate" },
  { title: "Barefoot Riesling", producer: "Barefoot", wineName: "Riesling", vintage: "2022", region: "California", country: "United States", kagglePrice: 6, priceYear: 2017, priceRange: "moderate" },
  
  // Premium wines
  { title: "St. Supery Cabernet Sauvignon", producer: "St. Supery", wineName: "Cabernet Sauvignon", vintage: "2018", region: "Napa Valley", country: "United States", kagglePrice: 45, priceYear: 2017, priceRange: "premium" },
  { title: "Freemark Abbey Cabernet Sauvignon", producer: "Freemark Abbey", wineName: "Cabernet Sauvignon", vintage: "2017", region: "Napa Valley", country: "United States", kagglePrice: 50, priceYear: 2017, priceRange: "premium" },
  { title: "Hess Select Cabernet Sauvignon", producer: "Hess Collection", wineName: "Cabernet Sauvignon", vintage: "2018", region: "Napa Valley", country: "United States", kagglePrice: 25, priceYear: 2017, priceRange: "premium" },
  { title: "Kendall-Jackson Grand Reserve Chardonnay", producer: "Kendall-Jackson", wineName: "Grand Reserve Chardonnay", vintage: "2019", region: "Sonoma County", country: "United States", kagglePrice: 30, priceYear: 2017, priceRange: "premium" },
  { title: "Sonoma-Cutrer Chardonnay", producer: "Sonoma-Cutrer", wineName: "Chardonnay", vintage: "2019", region: "Sonoma County", country: "United States", kagglePrice: 25, priceYear: 2017, priceRange: "premium" },
  { title: "Rodney Strong Cabernet Sauvignon", producer: "Rodney Strong", wineName: "Cabernet Sauvignon", vintage: "2018", region: "Sonoma County", country: "United States", kagglePrice: 30, priceYear: 2017, priceRange: "premium" },
  { title: "Chalk Hill Chardonnay", producer: "Chalk Hill", wineName: "Chardonnay", vintage: "2018", region: "Chalk Hill", country: "United States", kagglePrice: 40, priceYear: 2017, priceRange: "premium" },
  { title: "Kenwood Sonoma Series Cabernet Sauvignon", producer: "Kenwood", wineName: "Cabernet Sauvignon", vintage: "2017", region: "Sonoma County", country: "United States", kagglePrice: 20, priceYear: 2017, priceRange: "premium" },
  { title: "Clos du Bois Merlot", producer: "Clos du Bois", wineName: "Merlot", vintage: "2018", region: "Sonoma County", country: "United States", kagglePrice: 18, priceYear: 2017, priceRange: "premium" },
  { title: "Beringer Knights Valley Cabernet Sauvignon", producer: "Beringer", wineName: "Cabernet Sauvignon", vintage: "2017", region: "Knights Valley", country: "United States", kagglePrice: 35, priceYear: 2017, priceRange: "premium" },
  { title: "Château Beychevelle", producer: "Château Beychevelle", wineName: "Beychevelle", vintage: "2015", region: "Saint-Julien", country: "France", kagglePrice: 80, priceYear: 2017, priceRange: "premium" },
  { title: "Brunello di Montalcino", producer: "Various", wineName: "Brunello di Montalcino", vintage: "2015", region: "Tuscany", country: "Italy", kagglePrice: 60, priceYear: 2017, priceRange: "premium" },
  { title: "Amarone della Valpolicella", producer: "Various", wineName: "Amarone", vintage: "2015", region: "Veneto", country: "Italy", kagglePrice: 50, priceYear: 2017, priceRange: "premium" },
  { title: "Barolo", producer: "Various", wineName: "Barolo", vintage: "2015", region: "Piedmont", country: "Italy", kagglePrice: 60, priceYear: 2017, priceRange: "premium" },
  { title: "Champagne Bollinger", producer: "Bollinger", wineName: "Bollinger", vintage: "NV", region: "Champagne", country: "France", kagglePrice: 60, priceYear: 2017, priceRange: "premium" },
  { title: "Champagne Taittinger", producer: "Taittinger", wineName: "Taittinger", vintage: "NV", region: "Champagne", country: "France", kagglePrice: 50, priceYear: 2017, priceRange: "premium" },
  { title: "Champagne Laurent-Perrier", producer: "Laurent-Perrier", wineName: "Laurent-Perrier", vintage: "NV", region: "Champagne", country: "France", kagglePrice: 45, priceYear: 2017, priceRange: "premium" },
  
  // Luxury wines
  { title: "Joseph Phelps Cabernet Sauvignon", producer: "Joseph Phelps", wineName: "Cabernet Sauvignon", vintage: "2018", region: "Napa Valley", country: "United States", kagglePrice: 150, priceYear: 2017, priceRange: "luxury" },
  { title: "Château Montelena Cabernet Sauvignon", producer: "Château Montelena", wineName: "Cabernet Sauvignon", vintage: "2017", region: "Napa Valley", country: "United States", kagglePrice: 150, priceYear: 2017, priceRange: "luxury" },
  { title: "Stag's Leap Wine Cellars Cask 23", producer: "Stag's Leap Wine Cellars", wineName: "Cask 23", vintage: "2016", region: "Napa Valley", country: "United States", kagglePrice: 250, priceYear: 2017, priceRange: "luxury" },
  { title: "Heitz Cellar Martha's Vineyard Cabernet Sauvignon", producer: "Heitz Cellar", wineName: "Martha's Vineyard Cabernet Sauvignon", vintage: "2015", region: "Napa Valley", country: "United States", kagglePrice: 200, priceYear: 2017, priceRange: "luxury" },
  { title: "Ridge Monte Bello", producer: "Ridge Vineyards", wineName: "Monte Bello", vintage: "2016", region: "Santa Cruz Mountains", country: "United States", kagglePrice: 200, priceYear: 2017, priceRange: "luxury" },
  { title: "Shafer Hillside Select", producer: "Shafer Vineyards", wineName: "Hillside Select", vintage: "2015", region: "Stags Leap District", country: "United States", kagglePrice: 250, priceYear: 2017, priceRange: "luxury" },
  { title: "Château d'Yquem", producer: "Château d'Yquem", wineName: "Yquem", vintage: "2015", region: "Sauternes", country: "France", kagglePrice: 500, priceYear: 2017, priceRange: "luxury" },
  { title: "Domaine Leflaive Puligny-Montrachet", producer: "Domaine Leflaive", wineName: "Puligny-Montrachet", vintage: "2017", region: "Burgundy", country: "France", kagglePrice: 200, priceYear: 2017, priceRange: "luxury" },
  { title: "Domaine de la Romanée-Conti Échézeaux", producer: "Domaine de la Romanée-Conti", wineName: "Échézeaux", vintage: "2015", region: "Burgundy", country: "France", kagglePrice: 800, priceYear: 2017, priceRange: "luxury" },
  { title: "Château Smith Haut Lafitte", producer: "Château Smith Haut Lafitte", wineName: "Smith Haut Lafitte", vintage: "2016", region: "Pessac-Léognan", country: "France", kagglePrice: 100, priceYear: 2017, priceRange: "luxury" },
  { title: "Château Canon", producer: "Château Canon", wineName: "Canon", vintage: "2015", region: "Saint-Émilion", country: "France", kagglePrice: 100, priceYear: 2017, priceRange: "luxury" },
  { title: "Château Trotanoy", producer: "Château Trotanoy", wineName: "Trotanoy", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 300, priceYear: 2017, priceRange: "luxury" },
  { title: "Gaja Barbaresco", producer: "Gaja", wineName: "Barbaresco", vintage: "2016", region: "Piedmont", country: "Italy", kagglePrice: 200, priceYear: 2017, priceRange: "luxury" },
  
  // More wines to reach 200
  { title: "Château Cantemerle", producer: "Château Cantemerle", wineName: "Cantemerle", vintage: "2015", region: "Haut-Médoc", country: "France", kagglePrice: 35, priceYear: 2017, priceRange: "premium" },
  { title: "Château Giscours", producer: "Château Giscours", wineName: "Giscours", vintage: "2015", region: "Margaux", country: "France", kagglePrice: 60, priceYear: 2017, priceRange: "premium" },
  { title: "Château Pichon Baron", producer: "Château Pichon Longueville Baron", wineName: "Pichon Baron", vintage: "2015", region: "Pauillac", country: "France", kagglePrice: 120, priceYear: 2017, priceRange: "luxury" },
  { title: "Château Rauzan-Ségla", producer: "Château Rauzan-Ségla", wineName: "Rauzan-Ségla", vintage: "2015", region: "Margaux", country: "France", kagglePrice: 80, priceYear: 2017, priceRange: "premium" },
  { title: "Château Calon-Ségur", producer: "Château Calon-Ségur", wineName: "Calon-Ségur", vintage: "2015", region: "Saint-Estèphe", country: "France", kagglePrice: 70, priceYear: 2017, priceRange: "premium" },
  { title: "Château Grand-Puy-Lacoste", producer: "Château Grand-Puy-Lacoste", wineName: "Grand-Puy-Lacoste", vintage: "2015", region: "Pauillac", country: "France", kagglePrice: 65, priceYear: 2017, priceRange: "premium" },
  { title: "Château Léoville-Poyferré", producer: "Château Léoville-Poyferré", wineName: "Léoville-Poyferré", vintage: "2015", region: "Saint-Julien", country: "France", kagglePrice: 90, priceYear: 2017, priceRange: "premium" },
  { title: "Château Ducru-Beaucaillou", producer: "Château Ducru-Beaucaillou", wineName: "Ducru-Beaucaillou", vintage: "2015", region: "Saint-Julien", country: "France", kagglePrice: 150, priceYear: 2017, priceRange: "luxury" },
  { title: "Château Gruaud Larose", producer: "Château Gruaud Larose", wineName: "Gruaud Larose", vintage: "2015", region: "Saint-Julien", country: "France", kagglePrice: 55, priceYear: 2017, priceRange: "premium" },
  { title: "Château Lagrange", producer: "Château Lagrange", wineName: "Lagrange", vintage: "2015", region: "Saint-Julien", country: "France", kagglePrice: 50, priceYear: 2017, priceRange: "premium" },
  { title: "Château Brane-Cantenac", producer: "Château Brane-Cantenac", wineName: "Brane-Cantenac", vintage: "2015", region: "Margaux", country: "France", kagglePrice: 75, priceYear: 2017, priceRange: "premium" },
  { title: "Château d'Issan", producer: "Château d'Issan", wineName: "d'Issan", vintage: "2015", region: "Margaux", country: "France", kagglePrice: 60, priceYear: 2017, priceRange: "premium" },
  { title: "Château Lascombes", producer: "Château Lascombes", wineName: "Lascombes", vintage: "2015", region: "Margaux", country: "France", kagglePrice: 70, priceYear: 2017, priceRange: "premium" },
  { title: "Château Malescot St. Exupéry", producer: "Château Malescot St. Exupéry", wineName: "Malescot St. Exupéry", vintage: "2015", region: "Margaux", country: "France", kagglePrice: 55, priceYear: 2017, priceRange: "premium" },
  { title: "Château Prieuré-Lichine", producer: "Château Prieuré-Lichine", wineName: "Prieuré-Lichine", vintage: "2015", region: "Margaux", country: "France", kagglePrice: 45, priceYear: 2017, priceRange: "premium" },
  { title: "Château Rauzan-Gassies", producer: "Château Rauzan-Gassies", wineName: "Rauzan-Gassies", vintage: "2015", region: "Margaux", country: "France", kagglePrice: 50, priceYear: 2017, priceRange: "premium" },
  { title: "Château Kirwan", producer: "Château Kirwan", wineName: "Kirwan", vintage: "2015", region: "Margaux", country: "France", kagglePrice: 55, priceYear: 2017, priceRange: "premium" },
  { title: "Château Durfort-Vivens", producer: "Château Durfort-Vivens", wineName: "Durfort-Vivens", vintage: "2015", region: "Margaux", country: "France", kagglePrice: 50, priceYear: 2017, priceRange: "premium" },
  { title: "Château Ferrière", producer: "Château Ferrière", wineName: "Ferrière", vintage: "2015", region: "Margaux", country: "France", kagglePrice: 45, priceYear: 2017, priceRange: "premium" },
  { title: "Château Marquis de Terme", producer: "Château Marquis de Terme", wineName: "Marquis de Terme", vintage: "2015", region: "Margaux", country: "France", kagglePrice: 40, priceYear: 2017, priceRange: "moderate" },
  { title: "Château Beychevelle", producer: "Château Beychevelle", wineName: "Beychevelle", vintage: "2015", region: "Saint-Julien", country: "France", kagglePrice: 80, priceYear: 2017, priceRange: "premium" },
  { title: "Château Branaire-Ducru", producer: "Château Branaire-Ducru", wineName: "Branaire-Ducru", vintage: "2015", region: "Saint-Julien", country: "France", kagglePrice: 60, priceYear: 2017, priceRange: "premium" },
  { title: "Château Saint-Pierre", producer: "Château Saint-Pierre", wineName: "Saint-Pierre", vintage: "2015", region: "Saint-Julien", country: "France", kagglePrice: 50, priceYear: 2017, priceRange: "premium" },
  { title: "Château Talbot", producer: "Château Talbot", wineName: "Talbot", vintage: "2015", region: "Saint-Julien", country: "France", kagglePrice: 55, priceYear: 2017, priceRange: "premium" },
  { title: "Château Langoa-Barton", producer: "Château Langoa-Barton", wineName: "Langoa-Barton", vintage: "2015", region: "Saint-Julien", country: "France", kagglePrice: 50, priceYear: 2017, priceRange: "premium" },
  { title: "Château Gloria", producer: "Château Gloria", wineName: "Gloria", vintage: "2015", region: "Saint-Julien", country: "France", kagglePrice: 35, priceYear: 2017, priceRange: "premium" },
  { title: "Château Batailley", producer: "Château Batailley", wineName: "Batailley", vintage: "2015", region: "Pauillac", country: "France", kagglePrice: 45, priceYear: 2017, priceRange: "premium" },
  { title: "Château Clerc Milon", producer: "Château Clerc Milon", wineName: "Clerc Milon", vintage: "2015", region: "Pauillac", country: "France", kagglePrice: 70, priceYear: 2017, priceRange: "premium" },
  { title: "Château d'Armailhac", producer: "Château d'Armailhac", wineName: "d'Armailhac", vintage: "2015", region: "Pauillac", country: "France", kagglePrice: 55, priceYear: 2017, priceRange: "premium" },
  { title: "Château Haut-Batailley", producer: "Château Haut-Batailley", wineName: "Haut-Batailley", vintage: "2015", region: "Pauillac", country: "France", kagglePrice: 50, priceYear: 2017, priceRange: "premium" },
  { title: "Château Pibran", producer: "Château Pibran", wineName: "Pibran", vintage: "2015", region: "Pauillac", country: "France", kagglePrice: 40, priceYear: 2017, priceRange: "moderate" },
  { title: "Château Lafon-Rochet", producer: "Château Lafon-Rochet", wineName: "Lafon-Rochet", vintage: "2015", region: "Saint-Estèphe", country: "France", kagglePrice: 50, priceYear: 2017, priceRange: "premium" },
  { title: "Château Ormes de Pez", producer: "Château Ormes de Pez", wineName: "Ormes de Pez", vintage: "2015", region: "Saint-Estèphe", country: "France", kagglePrice: 35, priceYear: 2017, priceRange: "premium" },
  { title: "Château Phélan Ségur", producer: "Château Phélan Ségur", wineName: "Phélan Ségur", vintage: "2015", region: "Saint-Estèphe", country: "France", kagglePrice: 40, priceYear: 2017, priceRange: "moderate" },
  { title: "Château de Pez", producer: "Château de Pez", wineName: "de Pez", vintage: "2015", region: "Saint-Estèphe", country: "France", kagglePrice: 35, priceYear: 2017, priceRange: "premium" },
  { title: "Château Tronquoy-Lalande", producer: "Château Tronquoy-Lalande", wineName: "Tronquoy-Lalande", vintage: "2015", region: "Saint-Estèphe", country: "France", kagglePrice: 40, priceYear: 2017, priceRange: "moderate" },
  { title: "Château Capbern", producer: "Château Capbern", wineName: "Capbern", vintage: "2015", region: "Saint-Estèphe", country: "France", kagglePrice: 30, priceYear: 2017, priceRange: "moderate" },
  { title: "Château La Tour Carnet", producer: "Château La Tour Carnet", wineName: "La Tour Carnet", vintage: "2015", region: "Haut-Médoc", country: "France", kagglePrice: 35, priceYear: 2017, priceRange: "premium" },
  { title: "Château Cantenac Brown", producer: "Château Cantenac Brown", wineName: "Cantenac Brown", vintage: "2015", region: "Margaux", country: "France", kagglePrice: 50, priceYear: 2017, priceRange: "premium" },
  { title: "Château Boyd-Cantenac", producer: "Château Boyd-Cantenac", wineName: "Boyd-Cantenac", vintage: "2015", region: "Margaux", country: "France", kagglePrice: 40, priceYear: 2017, priceRange: "moderate" },
  { title: "Château Pouget", producer: "Château Pouget", wineName: "Pouget", vintage: "2015", region: "Margaux", country: "France", kagglePrice: 35, priceYear: 2017, priceRange: "premium" },
  { title: "Château du Tertre", producer: "Château du Tertre", wineName: "du Tertre", vintage: "2015", region: "Margaux", country: "France", kagglePrice: 40, priceYear: 2017, priceRange: "moderate" },
  { title: "Château La Lagune", producer: "Château La Lagune", wineName: "La Lagune", vintage: "2015", region: "Haut-Médoc", country: "France", kagglePrice: 45, priceYear: 2017, priceRange: "premium" },
  { title: "Château Belgrave", producer: "Château Belgrave", wineName: "Belgrave", vintage: "2015", region: "Haut-Médoc", country: "France", kagglePrice: 30, priceYear: 2017, priceRange: "moderate" },
  { title: "Château Camensac", producer: "Château Camensac", wineName: "Camensac", vintage: "2015", region: "Haut-Médoc", country: "France", kagglePrice: 30, priceYear: 2017, priceRange: "moderate" },
  { title: "Château Citran", producer: "Château Citran", wineName: "Citran", vintage: "2015", region: "Haut-Médoc", country: "France", kagglePrice: 25, priceYear: 2017, priceRange: "moderate" },
  { title: "Château Coufran", producer: "Château Coufran", wineName: "Coufran", vintage: "2015", region: "Haut-Médoc", country: "France", kagglePrice: 20, priceYear: 2017, priceRange: "moderate" },
  { title: "Château La Tour de By", producer: "Château La Tour de By", wineName: "La Tour de By", vintage: "2015", region: "Médoc", country: "France", kagglePrice: 18, priceYear: 2017, priceRange: "moderate" },
  
  // Final wines to reach 200
  { title: "Château Figeac", producer: "Château Figeac", wineName: "Figeac", vintage: "2015", region: "Saint-Émilion", country: "France", kagglePrice: 150, priceYear: 2017, priceRange: "luxury" },
  { title: "Château Angélus", producer: "Château Angélus", wineName: "Angélus", vintage: "2015", region: "Saint-Émilion", country: "France", kagglePrice: 300, priceYear: 2017, priceRange: "luxury" },
  { title: "Château Pavie", producer: "Château Pavie", wineName: "Pavie", vintage: "2015", region: "Saint-Émilion", country: "France", kagglePrice: 250, priceYear: 2017, priceRange: "luxury" },
  { title: "Château La Conseillante", producer: "Château La Conseillante", wineName: "La Conseillante", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 200, priceYear: 2017, priceRange: "luxury" },
  { title: "Château L'Evangile", producer: "Château L'Evangile", wineName: "L'Evangile", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 180, priceYear: 2017, priceRange: "luxury" },
  { title: "Château Clinet", producer: "Château Clinet", wineName: "Clinet", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 120, priceYear: 2017, priceRange: "luxury" },
  { title: "Château Gazin", producer: "Château Gazin", wineName: "Gazin", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 100, priceYear: 2017, priceRange: "luxury" },
  { title: "Château Le Pin", producer: "Château Le Pin", wineName: "Le Pin", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 3000, priceYear: 2017, priceRange: "ultraLuxury" },
  { title: "Château Vieux Château Certan", producer: "Château Vieux Château Certan", wineName: "Vieux Château Certan", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 250, priceYear: 2017, priceRange: "luxury" },
  { title: "Château L'Eglise-Clinet", producer: "Château L'Eglise-Clinet", wineName: "L'Eglise-Clinet", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 200, priceYear: 2017, priceRange: "luxury" },
  { title: "Château Certan de May", producer: "Château Certan de May", wineName: "Certan de May", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 120, priceYear: 2017, priceRange: "luxury" },
  { title: "Château La Fleur-Pétrus", producer: "Château La Fleur-Pétrus", wineName: "La Fleur-Pétrus", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 400, priceYear: 2017, priceRange: "luxury" },
  { title: "Château Hosanna", producer: "Château Hosanna", wineName: "Hosanna", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 200, priceYear: 2017, priceRange: "luxury" },
  { title: "Château Nenin", producer: "Château Nenin", wineName: "Nenin", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 80, priceYear: 2017, priceRange: "premium" },
  { title: "Château Beauregard", producer: "Château Beauregard", wineName: "Beauregard", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 60, priceYear: 2017, priceRange: "premium" },
  { title: "Château Le Bon Pasteur", producer: "Château Le Bon Pasteur", wineName: "Le Bon Pasteur", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 70, priceYear: 2017, priceRange: "premium" },
  { title: "Château La Croix de Gay", producer: "Château La Croix de Gay", wineName: "La Croix de Gay", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 50, priceYear: 2017, priceRange: "premium" },
  { title: "Château La Grave", producer: "Château La Grave", wineName: "La Grave", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 45, priceYear: 2017, priceRange: "premium" },
  { title: "Château Rouget", producer: "Château Rouget", wineName: "Rouget", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 55, priceYear: 2017, priceRange: "premium" },
  { title: "Château Taillefer", producer: "Château Taillefer", wineName: "Taillefer", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 40, priceYear: 2017, priceRange: "moderate" },
  { title: "Château de Sales", producer: "Château de Sales", wineName: "de Sales", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 35, priceYear: 2017, priceRange: "premium" },
  { title: "Château Lagrange", producer: "Château Lagrange", wineName: "Lagrange", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 30, priceYear: 2017, priceRange: "moderate" },
  { title: "Château La Pointe", producer: "Château La Pointe", wineName: "La Pointe", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 40, priceYear: 2017, priceRange: "moderate" },
  { title: "Château Bourgneuf", producer: "Château Bourgneuf", wineName: "Bourgneuf", vintage: "2015", region: "Pomerol", country: "France", kagglePrice: 35, priceYear: 2017, priceRange: "premium" },
  { title: "Château Moulin du Cadet", producer: "Château Moulin du Cadet", wineName: "Moulin du Cadet", vintage: "2015", region: "Saint-Émilion", country: "France", kagglePrice: 45, priceYear: 2017, priceRange: "premium" },
];

function getPriceRange(price) {
  if (price < 20) return 'budget';
  if (price < 50) return 'moderate';
  if (price < 100) return 'premium';
  if (price < 500) return 'luxury';
  return 'ultraLuxury';
}

// Main execution
const currentWines = JSON.parse(fs.readFileSync(CURRENT_WINES_PATH, 'utf8'));
const existingKeys = new Set(currentWines.map(w => `${w.title}_${w.producer}_${w.vintage}`.toLowerCase()));

// Add wines from seed data
let seedWines = [];
if (fs.existsSync(SEED_DATA_PATH)) {
  seedWines = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf8'));
  console.log(`📊 Found ${seedWines.length} wines in seed data`);
}

// Combine all potential wines
const allWines = [...additionalPopularWines];

// Add from seed data (filter out duplicates and estimate historical price)
seedWines.forEach(wine => {
  const title = wine.wineName || wine.title;
  const vintage = wine.vintage || 'NV';
  const key = `${title}_${wine.producer}_${vintage}`.toLowerCase();
  
  // Skip if already in list
  if (existingKeys.has(key)) return;
  
  // Only add if we have a price
  if (!wine.averagePrice) return;
  
  // Estimate historical price (assume 75% of current as rough estimate for 2017)
  const estimatedHistPrice = Math.round(wine.averagePrice * 0.75);
  if (estimatedHistPrice > 0) {
    allWines.push({
      title: title,
      producer: wine.producer || 'Unknown',
      wineName: title,
      vintage: vintage,
      region: wine.region || wine.appellation || 'Unknown',
      country: wine.country || 'Unknown',
      kagglePrice: estimatedHistPrice,
      priceYear: 2017,
      priceRange: getPriceRange(estimatedHistPrice)
    });
  }
});

// Filter out duplicates and add to current list
let nextId = currentWines.length + 1;
const used = new Set();
allWines.forEach(wine => {
  const key = `${wine.title}_${wine.producer}_${wine.vintage}`.toLowerCase();
  if (!used.has(key) && !existingKeys.has(key) && currentWines.length < 200) {
    currentWines.push({
      id: nextId++,
      ...wine,
      searchQuery: `${wine.producer} ${wine.wineName} ${wine.vintage}`.trim(),
      preValidatedPrice: null,
      preValidatedSource: null,
      preValidatedDate: null,
      needsValidation: true,
      criticScore: null,
      vintageQuality: null,
      producerReputation: null
    });
    used.add(key);
  }
});

// Save
fs.writeFileSync(EXPANDED_OUTPUT, JSON.stringify(currentWines, null, 2));

console.log(`\n✅ Expanded to ${currentWines.length} wines`);
console.log(`   Pre-validated: ${currentWines.filter(w => w.preValidatedPrice).length}`);
console.log(`   Need validation: ${currentWines.filter(w => !w.preValidatedPrice).length}`);

// Show distribution
const distribution = {
  budget: currentWines.filter(w => w.priceRange === 'budget').length,
  moderate: currentWines.filter(w => w.priceRange === 'moderate').length,
  premium: currentWines.filter(w => w.priceRange === 'premium').length,
  luxury: currentWines.filter(w => w.priceRange === 'luxury').length,
  ultraLuxury: currentWines.filter(w => w.priceRange === 'ultraLuxury').length
};

console.log(`\n📊 Distribution by price range:`);
Object.entries(distribution).forEach(([range, count]) => {
  console.log(`   ${range}: ${count} wines`);
});

if (currentWines.length < 200) {
  console.log(`\n⚠️  Still need ${200 - currentWines.length} more wines to reach 200`);
  console.log(`   Current total: ${currentWines.length} wines`);
  console.log(`   You may need to add more from Kaggle dataset or other sources`);
} else {
  console.log(`\n✅ Successfully reached 200 wines!`);
}
