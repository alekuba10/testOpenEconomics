import React, { useEffect, useState } from "react"

import './App.css';

const App = () => {
  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState([])
  const [speciesRegion, setSpeciesByRegion] = useState([])
  const [speciesList, setSpeciesList] = useState([])
  const [conservationMesauresList, setArrayConservationMesaures] = useState([])
  const [mammaliaClassList, setMammaliaClass] = useState([])

  const [loadingSpecies, setLoadingSpecies] = useState(true)
  const [loadingCR, setLoadingCR] = useState(true)



  useEffect(() => {
    fetchRegionData();
  }, [])

  useEffect(() => {
    filterCRSpecies();
    filterMammalClass();
  }, [speciesList])


  const fetchRegionData = () => {

    setLoadingSpecies(true);

    fetch("http://apiv3.iucnredlist.org/api/v3/region/list?token=9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee")
      .then(response => {
        return response.json()
      })
      .then(data => { 
        setRegions(data.results)

        var randomId = Math.floor((Math.random() * data.results.length));

        setSelectedRegion(data.results[randomId].identifier)

        fetchSpeciesByRegion(data.results[randomId].identifier)
      })
  }


  const fetchSpeciesByRegion = (region) => {

    fetch("http://apiv3.iucnredlist.org/api/v3/species/region/" + region + "/page/0?token=9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee")
      .then(response => {
        return response.json()
      })
      .then(data => { 

        setSpeciesByRegion(data.result)

        const species = data.result.map(speciesData => ({
          id: speciesData.taxonid,
          kingdomName: speciesData.kingdom_name,
          phylumName: speciesData.phylum_name,
          orderName: speciesData.order_name,
          className: speciesData.class_name,
          scientificName: speciesData.scientific_name,
          commonName: speciesData.main_common_name,
          familyName: speciesData.family_name,
          genusName: speciesData.genus_name,
          taxonomicAuthority: speciesData.taxonomic_authority,
          infraRank: speciesData.infra_rank,
          infra_Name: speciesData.infra_name,
          category: speciesData.category,
        }));

        setSpeciesList(species); 
        
        setLoadingSpecies(false);
      }); 
  }


  const conservationMeasuresForCRSpecies = (speciesId) => {
    
    return fetch("http://apiv3.iucnredlist.org/api/v3/measures/species/id/" + speciesId + "?token=9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee")
    .then(response => {
      return response.json()
    })
    .then(data => {
      const arrayTitles = data.result.map(items => items.title)
      var stringTitles = " ";

      for(var i=0; i<arrayTitles.length; i++) {
        stringTitles = stringTitles + arrayTitles[i] + " "; 
      }
      
      return stringTitles; 
    })

  }  


  const filterCRSpecies = () => {

    setLoadingCR(true);
  
    const listCR = speciesList.filter(items => items.category == "CR");
    const arrayPromise = [];

    for(var i=0; i<listCR.length; i++) {
      arrayPromise.push(conservationMeasuresForCRSpecies(listCR[i].id)); 
    }  

    Promise.all(arrayPromise)
    .then( values => {
      
      setArrayConservationMesaures(values);

      setLoadingCR(false);
    });

  }

  
  const filterMammalClass = () => { 

    const listMammaliaClass = speciesList.filter(items => items.className == "MAMMALIA");
    setMammaliaClass(listMammaliaClass);   

  }

  if (loadingSpecies) {
    return <p>Loading species for region...</p>
  } 
  return (
    <div>
      <h3> Critically Endangered Species for this region (ID Region): {selectedRegion} </h3>
      {loadingCR ? (
        <p>LOADING Critically Endangered</p>
      ) : (conservationMesauresList.length > 0 ? (
        <ul>
          {conservationMesauresList.map((value, index) => (
            <li key={index}>
              <p> {value} </p>
            
          </li>
          ))}
           
        </ul>

      ) : <p>NO Critical Endangered Species for this region</p>)}


    <h3> Species for Mammalia class in Selected region (ID Region): {selectedRegion} </h3>
      {mammaliaClassList.length > 0 ? (
        <ul>
          {mammaliaClassList.map(mammaliaClass => (
            <li key={mammaliaClass.id}>
            <p> {mammaliaClass.id}, {mammaliaClass.scientificName}, {mammaliaClass.commonName}, {mammaliaClass.familyName},  
             {mammaliaClass.genusName}, {mammaliaClass.phylumName}, {mammaliaClass.orderName}, {mammaliaClass.kingdomName},  
             {mammaliaClass.taxonomicAuthority}</p>
          </li>
          ))}
           
        </ul>
      ) : <p>NO Mammalia Species for this region</p>}

       
    </div>
  );
}

export default App; 
