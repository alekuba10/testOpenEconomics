import React, {useEffect, useState} from "react"

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

    const buildAPIEndpoint = (endpoint, needToken = true) => {
        const fullEndpoint = new URL(`${process.env.REACT_APP_IUCN_BASE_ENDPOINT}${endpoint}`);
        if (needToken && !fullEndpoint.searchParams.has('token')) {
            fullEndpoint.searchParams.set('token', process.env.REACT_APP_IUCN_API_TOKEN);
        }
        return fullEndpoint.toString();
    }

    const getDataFromAPI = async (endpoint, needToken = true) => {
        const response = await fetch(buildAPIEndpoint(endpoint));
        return response.json();
    }

    const fetchRegionData = async () => {

        const data = await getDataFromAPI('/region/list');
        const randomElement = data.results[Math.floor((Math.random() * data.count))]?.identifier;

        setRegions(data.results);
        setSelectedRegion(randomElement);
        await fetchSpeciesByRegion(randomElement);
    }

    const fetchSpeciesByRegion = async (region, page = 0) => {

        const data = await getDataFromAPI(`/species/region/${region}/page/${page}`);
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
            infraName: speciesData.infra_name,
            category: speciesData.category,
        }));

        setSpeciesByRegion(data.results)
        setSpeciesList(species);
        setLoadingSpecies(false);
    }

    const conservationMeasuresForCRSpecies = async (speciesId) => {

        const data = await getDataFromAPI(`/species/id/${speciesId}`);
        return ' ' + data.result.map(item => item.scientific_name).join(" ")
    }

    const filterCRSpecies = async () => {

        setLoadingCR(true);
        const listCR = Promise.all(
            speciesList
                .filter(items => items.category === "CR")
                .map(
                    async (e) => await conservationMeasuresForCRSpecies(e.id)
                )
        );
        setArrayConservationMesaures(await listCR);
        setLoadingCR(false);
    }


    const filterMammalClass = () => setMammaliaClass(speciesList.filter(items => items.className === "MAMMALIA"));

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
