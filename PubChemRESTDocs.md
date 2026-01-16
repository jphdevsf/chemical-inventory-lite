# PubChem PUG REST API Documentation for Chemical Inventory App

This document outlines how to structure REST API calls to search the PubChem database for chemical information using the PUG REST API. This will be used in our chemical inventory application to fetch data when users enter chemicals into inventory.

## Base URL Structure

All PubChem PUG REST API calls follow this general structure:
```
https://pubchem.ncbi.nlm.nih.gov/rest/pug/<input specification>/<operation specification>/[<output specification>][?<operation_options>]
```

## Understanding PubChem Identifiers (SIDs, CIDs, and AIDs)

If you're not familiar with chemistry databases, you may encounter these acronyms in the documentation:

- **SID (Substance ID)**: A unique identifier for a specific chemical substance as it was deposited in PubChem. Each substance record contains information about the chemical structure, source, and other descriptive information. Multiple substances with the same chemical structure but different sources will have different SIDs.

- **CID (Compound ID)**: A unique identifier for a unique chemical structure in PubChem. Unlike SIDs, CIDs represent the actual chemical structure and are assigned after processing deposited substances. Multiple substances (SIDs) with the same structure will all be associated with the same CID.

- **AID (Assay ID)**: A unique identifier for a biological assay or experiment in PubChem. These represent tests that were performed to determine the biological activity of compounds, such as testing if a compound can inhibit a specific enzyme or kill cancer cells.

In simple terms:
- **SID** = A specific sample of a chemical from a particular source
- **CID** = A unique chemical structure (what the chemical actually is)
- **AID** = A biological test or experiment performed on chemicals

For a chemical inventory application, you'll primarily work with CIDs since you're interested in the actual chemical compounds rather than specific samples or tests.

## Search Methods for Chemical Inventory

### 1. Search by CAS Registry Number (RN)

To search by CAS Registry Number, use the compound domain with the xref namespace:

```
https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/xref/RN/<CAS_NUMBER>/cids/JSON
```

Example:
```
https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/xref/RN/50-00-0/cids/JSON
```

After obtaining the CID, you can retrieve detailed information:
```
https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/<CID>/property/MolecularFormula,MolecularWeight,InChIKey,IUPACName/JSON
```

### 2. Search by Chemical Name (CAS Name)

To search by chemical name, use the compound domain with the name namespace:

```
https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/<CHEMICAL_NAME>/cids/JSON
```

Example:
```
https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/aspirin/cids/JSON
```

For exact name matching, you can add the name_type parameter:
```
https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/<CHEMICAL_NAME>/cids/JSON?name_type=word
```

### 3. Search by Molecular Formula

To search by molecular formula, use the compound domain with the fastformula namespace:

```
https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastformula/<MOLECULAR_FORMULA>/cids/JSON
```

Example:
```
https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastformula/C9H8O4/cids/JSON
```

Options for formula search:
- `AllowOtherElements=true|false` - Allow other elements in addition to those specified (default: false)
- `MaxRecords=<number>` - Limit the number of results

Example with options:
```
https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastformula/C9H8O4/cids/JSON?AllowOtherElements=false&MaxRecords=10
```

### 4. Handling Deleted or Replaced CAS Registry Numbers

When searching with a CAS Registry Number that may have been deleted or replaced, the API will return a 404 error if no match is found:

```
{
  "Fault": {
    "Code": "PUGREST.NotFound",
    "Message": "The input record was not found (e.g. invalid CID)",
    "Details": {
      "name": "50-00-0-old"
    }
  }
}
```

To handle this in your application:
1. First try searching with the provided CID number
2. If you receive a 404 error, you may need to:
   - Check if the CID number was entered correctly
   - Consult PubChem's deprecated identifiers service (if available)
   - Allow the user to search by an alternative identifier

## Retrieving Chemical Properties

Once you have a CID from any of the search methods above, you can retrieve detailed chemical properties:

```
https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/<CID>/property/MolecularFormula,MolecularWeight,InChIKey,IUPACName,SMILES/JSON
```

## Complete List of Available Properties

Returns a table of compound properties. More than one property may be requested, in a comma-separated list of property tags in the request URL. Valid output formats for the property table are: XML, ASNT/B, JSON(P), CSV, and TXT (limited to a single property). Available properties are:

| Property | Notes |
|----------|-------|
| MolecularFormula | Molecular formula. |
| MolecularWeight | The molecular weight is the sum of all atomic weights of the constituent atoms in a compound, measured in g/mol. In the absence of explicit isotope labelling, averaged natural abundance is assumed. If an atom bears an explicit isotope label, 100% isotopic purity is assumed at this location. |
| SMILES | A SMILES (Simplified Molecular Input Line Entry System) string, which includes both stereochemical and isotopic information. See the glossary entry on SMILES for more detail. |
| ConnectivitySMILES | Connectivity SMILES (Simplified Molecular Input Line Entry System) string. Contains the connectivity layer only, and does NOT include stereochemistry or isotopes. |
| InChI | Standard IUPAC International Chemical Identifier (InChI). It does not allow for user selectable options in dealing with the stereochemistry and tautomer layers of the InChI string. |
| InChIKey | Hashed version of the full standard InChI, consisting of 27 characters. |
| IUPACName | Chemical name systematically determined according to the IUPAC nomenclatures. |
| Title | The title used for the compound summary page. |
| XLogP | Computationally generated octanol-water partition coefficient or distribution coefficient. XLogP is used as a measure of hydrophilicity or hydrophobicity of a molecule. |
| ExactMass | The mass of the most likely isotopic composition for a single molecule, corresponding to the most intense ion/molecule peak in a mass spectrum. |
| MonoisotopicMass | The mass of a molecule, calculated using the mass of the most abundant isotope of each element. |
| TPSA | Topological polar surface area, computed by the algorithm described in the paper by Ertl et al. |
| Complexity | The molecular complexity rating of a compound, computed using the Bertz/Hendrickson/Ihlenfeldt formula. |
| Charge | The total (or net) charge of a molecule. |
| HBondDonorCount | Number of hydrogen-bond donors in the structure. |
| HBondAcceptorCount | Number of hydrogen-bond acceptors in the structure. |
| RotatableBondCount | Number of rotatable bonds. |
| HeavyAtomCount | Number of non-hydrogen atoms. |
| IsotopeAtomCount | Number of atoms with enriched isotope(s) |
| AtomStereoCount | Total number of atoms with tetrahedral (sp3) stereo [e.g., (R)- or (S)-configuration] |
| DefinedAtomStereoCount | Number of atoms with defined tetrahedral (sp3) stereo. |
| UndefinedAtomStereoCount | Number of atoms with undefined tetrahedral (sp3) stereo. |
| BondStereoCount | Total number of bonds with planar (sp2) stereo [e.g., (E)- or (Z)-configuration]. |
| DefinedBondStereoCount | Number of atoms with defined planar (sp2) stereo. |
| UndefinedBondStereoCount | Number of atoms with undefined planar (sp2) stereo. |
| CovalentUnitCount | Number of covalently bound units. |
| PatentCount | Number of patent documents linked to this compound. |
| PatentFamilyCount | Number of unique patent families linked to this compound (e.g. patent documents grouped by family). |
| AnnotationTypes | Annotation types (general categories) for a compound. |
| AnnotationTypeCount | Count of annotation types for a compound. |
| SourceCategories | Deposited substance categories for a compound. |
| LiteratureCount | Number of articles linked to this compound (by PubChem's consolidated literature analysis). |
| Volume3D | Analytic volume of the first diverse conformer (default conformer) for a compound. |
| XStericQuadrupole3D | The x component of the quadrupole moment (Qx) of the first diverse conformer (default conformer) for a compound. |
| YStericQuadrupole3D | The y component of the quadrupole moment (Qy) of the first diverse conformer (default conformer) for a compound. |
| ZStericQuadrupole3D | The z component of the quadrupole moment (Qz) of the first diverse conformer (default conformer) for a compound. |
| FeatureCount3D | Total number of 3D features (the sum of FeatureAcceptorCount3D, FeatureDonorCount3D, FeatureAnionCount3D, FeatureCationCount3D, FeatureRingCount3D and FeatureHydrophobeCount3D) |
| FeatureAcceptorCount3D | Number of hydrogen-bond acceptors of a conformer. |
| FeatureDonorCount3D | Number of hydrogen-bond donors of a conformer. |
| FeatureAnionCount3D | Number of anionic centers (at pH 7) of a conformer. |
| FeatureCationCount3D | Number of cationic centers (at pH 7) of a conformer. |
| FeatureRingCount3D | Number of rings of a conformer. |
| FeatureHydrophobeCount3D | Number of hydrophobes of a conformer. |
| ConformerModelRMSD3D | Conformer sampling RMSD in Å. |
| EffectiveRotorCount3D | Total number of 3D features (the sum of FeatureAcceptorCount3D, FeatureDonorCount3D, FeatureAnionCount3D, FeatureCationCount3D, FeatureRingCount3D and FeatureHydrophobeCount3D) |
| ConformerCount3D | The number of conformers in the conformer model for a compound. |
| Fingerprint2D | Base64-encoded PubChem Substructure Fingerprint of a molecule. |

## Error Handling

Common HTTP status codes:
- 200: Success
- 400: PUGREST.BadRequest - Request is improperly formed
- 404: PUGREST.NotFound - The input record was not found
- 405: PUGREST.NotAllowed - Request not allowed
- 500: PUGREST.Unknown or PUGREST.ServerError - Server-side error
- 501: PUGREST.Unimplemented - Operation not yet implemented
- 503: PUGREST.ServerBusy - Too many requests, retry later
- 504: PUGREST.Timeout - Request timed out

## Rate Limiting

PubChem requests a maximum of 5 requests per second to avoid overloading their servers. Implement appropriate delays in your application to stay within this limit.

## Example Implementation Flow

1. User enters a chemical identifier (name, CID number, or formula)
2. Application determines the identifier type
3. Application constructs the appropriate API call:
   - For CAS RN: `compound/xref/RN/<value>/cids/JSON`
   - For name: `compound/name/<value>/cids/JSON`
   - For formula: `compound/fastformula/<value>/cids/JSON`
4. Application handles the response:
   - Success: Extract CID and fetch detailed properties
   - Error: Handle appropriately (404 for not found, etc.)
5. Display chemical information to the user

## Specific Example: Searching for "aspirin"

When a user searches for "aspirin", the following API calls are needed to retrieve all required information:

### 1. Get CID for aspirin
```
GET https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/aspirin/cids/JSON
```

### 2. Get structure image URL
```
GET https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/2244/PNG
```

### 3. Get detailed properties
```
GET https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/2244/property/Title,SourceCategories,Fingerprint2D,MolecularFormula,MolecularWeight,SMILES,IUPACName,InChi,InChiKey/JSON
```

### 4. Get description
```
GET https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/2244/description/JSON
```

### 5. Get synonyms
```
GET https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/2244/synonyms/JSON
```


### 6. Get dates
```
GET https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/2244/dates/JSON
```


### 7. Get Full Record (seems incomplete though)
```
GET https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/2244/JSON
```

## Required Data Mapping

| Display Field | API Source |
|---------------|------------|
| PubChem CID | `compound/name/aspirin/cids/JSON` |
| Structure image | `compound/cid/2244/PNG` |
| Primary Hazards | `compound/cid/2244/JSON` (full record) |
| Laboratory Chemical Safety Summary (LCSS) Datasheet URL | `https://pubchem.ncbi.nlm.nih.gov/compound/2244#section=LCSS` |
| Molecular Formula | `compound/cid/2244/property/MolecularFormula/JSON` |
| Synonyms | `compound/cid/2244/synonyms/JSON` |
| Molecular Weight | `compound/cid/2244/property/MolecularWeight/JSON` |
| Computed by PubChem 2.2 (PubChem release 2025.04.14) | Part of metadata in property responses |
| Dates Created | `compound/cid/2244/dates/JSON` |
| Dates Modified | `compound/cid/2244/dates/JSON` |
| Description | `compound/cid/2244/description/JSON` |