TODO: Doku zu Ende, aussagekräftige Kommentare in tree directive
Documentation

---- File system ----

index.html:
- Controls the layout of the user interface
- Only calls the single components

*/ app.js
- is executed at the beginning
- load initial data: the proband dataset, the list of attributes including details and type, the list of attributes sorted into categories
- initialize the list of subgroups for filtering with the complete dataset as well as set the initially selected subgroup to this group
- set a list of attributes containing the distribution and type for each attribute
- controller for displaying context information according to selected attribute /*

data:
- attributes.json -> contains all attributes sorted into 12 categories, used for visualization of list of attributes
- dictionary_new_names.json -> contains all attributes including a short description and the type of attribute (nominal, ordinal, ...), needed for displaying attribute data according to type (barchart or graph)
- breast_fat_labels.csv -> full dataset of probands

bower_components:
- contains the used libraries:
  Angular to manage the code
  Bootstrap for the layout
  D3 for simply creating visualizations

assets:
- contains all additional files such as css files (sorted by component) for design, additional fonts and js files

---- Components ----

Dataservice (services/data.service.js)
This class organizes the data, traces current stati and provides functions to do calculations  and filter processes on the data as well as exporting the created subgroups.
Member variables:
  dataset
  subgroups
  selectedSub
  attributes
  currentAttribute
  jsondata
  visdata
Member functions:
  setCurrentAttribute
  setAttributes
  filterToCSV
  calcDistribution
  getCSVString
  saveSubgroup
  getIndex
  alreadyUsed
  findNeigh
  findDown
  uniq_fast

Barchart (directives/barchart.directive.js)
This directive creates a barchart visualizing the distribution of a not continuous attribute as soon as such an attribute is selected.
Filtering can be done by selecting single/multiple bars via mouseclick or selection frame and hitting the button "Apply filter". This creates a new subgroup with probands that fulfill the chosen criteria.
If one or more subgroups have already been created then the bars are subdivided showing the initial distribution (blue) as well as the distribution within the selected subgroup (grey).

Graph (directives/graph.directive.js)
This directive creates a line graph visualizing the distribution of a continous attribute as soon as such an attribute is selected.

Filterbar (directives/filterbar.directive.js)
TODO

Progressbar (directives/progressbar.directive.js)
This directive visualizes how many probands of the initial dataset are left in a subgroup. With each filtering the progressbar is updated showing the percentage of probands in the resulting subgroup compared to the number of probands in the initial dataset.
"Unter Anderem" This prevents the user from creating subgroups with too few probands that are not statistically relevant.

Searchbar (directives/searchbar.directive.js)
TODO

List of Attributes (directives/tree.directive.js)
TODO
