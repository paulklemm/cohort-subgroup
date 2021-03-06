Visual Analysis of Cohort Study Data  
====================================

**This interface is used for intuitively and effectively filtering a given dataset consisting of about 300 attributes for each participant to create subject subgroups that can then be analyzed using a method of choice.**

*The prototype currently only works using Firefox (Tested with Firefox 39.0)*

-----------------

File system
===========

###app  
This folder contains the directives and services that control the data management as well as the individual components.

###data  
This folder contains the data basis for the user interface. This includes the subject data as well as details and structuring of the attributes.  
*attributes.json*:
This file contains all attributes sorted into 12 categories and is used for the visualization as described in 'List of Attributes'.  
*dictionary_new_names.json*:  
This file contains a short description and the type (e.g. nominal, ordinal, ...) for each attribute. These information are needed for displaying the distribution of an attribute according to its type via barchart or graph.  
*breast_fat_labels.csv*:  
This file holds the full dataset of subjects consisting of ?.

###bower_components
This folder contains all required files for the used libraries.

###assets
This folder contains additional files such as css files and js files.  
*css*:  
The css files are organized by components. Each folder contains the css file that controls the style of the specific component.  
The main.css is the main stylesheet for the user interface. It holds all the values for the overall layout and arrangement of the components.  
*js*:  
This folder contains the js file for the tooltips used for filter elements. It holds a constructor as well as functions for showing, hiding, removing and manipulating tooltips in terms of attributes, style, direction, offset and content.

###index.html  
This is the default web page that is displayed when entering the URL.  
It is used to structure the interface by arranging the individual components within a grid layout. The components themselves are stored externally in directives (to be found in app/directives) and are just called within the index file.

###app.js  
This file designates the root element of the AngularJS application which is executed once the web page has loaded.  
It is therefore used to load the initial data: *attributes.json*, *dictionary_new_names.json* and *breast_fat_labels.csv* as mentioned above.  
Furthermore, initializing a list to manage the subgroups resulting from filtering takes place here. In the beginning, this list only consists of a subgroup holding the complete dataset. Setting the initially selected subgroup to this subgroup is also done.  
In addition, a list of all attributes containing the distribution and type for each attribute is set up here, whose exact data structure can be checked up in the section "Implementation".  
The app.js file also holds a controller for displaying context information according to the currently selected attribute.

-----------------

Libraries
=========
###AngularJS
This client-side web application framework is used to organize the code according to the model-view-controller architecture and therefore support the development of the user interface.
Among others it consists of directives that are embedded in the HTML document and tell Angular to run some JavaScript code as well as controllers that define the application's behavior by defining functions and values.
###Bootstrap  
This front-end framework supports responsive as well as fast and easy web development and provides various custom HTML and CSS components. It is used for keeping the layout simple and applicable to various devices of different shapes.
###D3  
This JavaScript library helps manipulating documents based on data. It combines powerful visualization components with a data-driven approach to DOM manipulation and therefore is used for simply visualizing the given subject data of the study.

-----------------

Components
==========
###Dataservice (services/data.service.js)  
This class forms the core of data handling.  
It holds all required global variables such as the data basis itself, arising data like created subgroups and metadata about attributes as well as current states e.g. the currently selected attribute or subgroup.  
Furthermore this service provides functions to make use of these data in terms of filtering or exporting created subgroups.

###Barchart (directives/barchart.directive.js)  
This directive creates a barchart visualizing the distribution of a not continuous attribute as soon as such an attribute is selected.  
Filtering can be done by selecting single/multiple bars via mouseclick or selection frame and hitting the button "Apply filter". This creates a new subgroup with subjects that fulfill the chosen criteria.
If one or more subgroups have already been created then the bars are subdivided showing the initial distribution (blue) as well as the distribution within the selected subgroup (grey).

###Graph (directives/graph.directive.js)  
This directive creates a line graph visualizing the distribution of a continous attribute as soon as such an attribute is selected.

###Filterbar (directives/filterbar.directive.js)  
This directive shows the history of filter processes.  
For each filtering process a new subgroup is created and visualized in terms of a filter element. Filter processes can be triggered out of every element, resulting in a new subgroup created out of the subgroup represented by the selected element. The arrangement of these elements reflects the course of filtering by means of connecting lines and position.  
A selected subgroup in the filterbar can be saved to the computer by clicking the disk button.

###Progressbar (directives/progressbar.directive.js)  
This directive visualizes how many subjects of the initial dataset are left in a subgroup. With each filtering the progressbar is updated showing the percentage of subjects in the resulting subgroup compared to the number of subjects in the initial dataset.  
Amongst others this prevents the user from creating subgroups with too few subjects that are not statistically relevant.

###Searchbar (directives/searchbar.directive.js)  
This searchfield is used to search for a specific attribute whose context information can then be viewed or that can be used for filtering.  
The list of attributes is searched for the searchterm and suggests attributes that match the searchterm or contain it.

###List of Attributes (directives/tree.directive.js)  
Exploring the list of attributes and selecting one of them for further processing is possible using a tree layout.  
A preview of the attributes' distributions can be seen inside the tree layout via small multiples.

-----------------

Implementation
==============

###services/data.service.js  
#####Variables  
var *dataset*: holds the subject data imported from data/breast_fat_labels.csv.  
type *dataset*: array of objects with every object representing a subject via enumeration of attributes and corresponding values.  
example *dataset*: [{Age: "34", Body_Weight: "68.5", ...}, {...}, ...]  

var *jsondata*: holds a detailed description in english and german as well as the type for each attribute  
type *jsondata*: object with an object for each attribute containing detail, detail_ger and type  
example *jsondata*: {Cohort: {detail: "Cohort affiliation (SHIP-TREND-0 or SHIP-2)", detail_ger: "Kohortenzugehörigkeit (SHIP-TREND-0 oder SHIP-2)", type: "nominal"}, Examination-Location: {...}, ...}  

var *visdata*: stores the hierarchical structure of attributes organized in categories for the visualization in a tree layout  
type *visdata*: object with root node (name) and array of objects as children which themselves have a name and child nodes  
example *visdata*:  
{name: "root", children: [  
  {name: "Study", \_children: [  
  {name: "Cohort", size: 8883}  
  ]},  
  {name: "Personal", \_children: [  
  {name: "Age", size: 8883},  
  {name: "Marital_Status", size: 8883},  
  {...},  
  {...}  
  ]},  
  {...},  
  ...  
]}  

var *subgroups*: holds the subgroups resulting from filter processes.  
Each time a filter is applied, the resulting subgroup is added to this list. From here they themselves can be filtered to create another subgroup or they can be exported for further analysis.  
Initially this variable consists of a subgroup "all" containing the initial subject dataset before any filtering was done.  
type *subgroups*: array of objects with an object representing a subgroup through row, column, attribute, pred, succ, filtervalues, data and percentage.  
row, column: position for corresponding filterelement inside the imaginary matrix  
attribute: the attribute according to which filtering was done, e.g. Age  
pred: the subgroup from which filtering was done to create this subgroup  
succ: the subgroup that was created by applying a filter on this subgroup  
filtervalues: the values of the given attribute that were used for filtering, e.g. >50  
data: the array of objects representing the resulting subjects that fulfill the filtervalues  
percentage: how many subjects of the initial number of subjects are left?  
Predecessor and successor are stored as the index where the predecessor subgroup or rather the successor subgroup is stored in the list of subgroups. The corresponding subgroup can therefore be accessed through *subgroups*[pred] or *subgroups*[succ].  
example *subgroups*: [{row: 0, column: 0, attribute: "all", pred: -1, succ: 1, filterValues: null, data: *dataset*, percentage: 1}, {row: 0, column: 1, attribute: "Cohort", pred: 0, succ: [], filterValues: "TREND0", data: [...], percentage: 0.62}, {...}, ...]  

var *attributes*: holds the distribution and type for every attribute  
type *attributes*: object with objects containing distribution and type for each attribute  
example *attributes*: {Cohort: {distribution: [{attributeValue: "SHIP2", value: 387}, {attributeValue: "TREND0", value: 631}], type: "nominal"}, Age: {...}, Mobility: {...}, ...}  

var *selectedSub*: holds the subgroup that is currently selected. Used for filtering and export of subgroups. Initialized with the complete subject dataset - the "all" subgroup in *subgroups*.  
type *selectedSub*: object  
example *selectedSub*: {row: 0, column: 1, attribute: "Cohort", pred: 0, succ: [], filterValues: "TREND0", data: [...], percentage: 0.62}

var *currentAttribute*: the attribute that is currently selected, resulting in the corresponding context information (barchart/graph) being displayed. Initially an empty string. Set via click on an attribute in searchbar or tree layout.  
type *currentAttribute*: string  
example *currentAttribute*: "Cohort"  

#####Functions  
*setCurrentAttribute*: sets the currently selected attribute  
@param name: the name of the currently selected attribute  
*setAttributes*: sets the distribution and type for every attribute  
@return: the list of attributes with distribution and type  
*getCSVString*: composes a string from subgroup data that is later encoded for csv export  
@param subgroup: the subgroup to be saved  
@return: the resulting string  
*getIndex*: gets position of a specific subgroup in the list of subgroups  
@param attribute: the attribute that was used to create the specific subgroup  
@return: the index of the subgroup  
*calcDistribution*: computes the distribution of an attribute  
@param key: the name of the attribute  
@param dataset: the dataset the distribution is based on  
@return: the distribution of the attribute as a list of every possible attribute value with the corresponding number  
*filterToCSV*: filters the currently selected subgroup according to the currently selected attribute  
@param filterValues: the criteria/attribute values according to which the subgroup is filtered  
*saveSubgroup*: exports the currently selected subgroup as csv file  
*alreadyUsed*: determines if attribute has already been used in the current filter process  
@param attribute: the attribute to be checked
@return: true if attribute has already been used  
*findNeigh*: determine if a filter element already exists in the column where filtered subgroup is to be placed  
@param row: the row in which the filtered subgroup is to be placed  
@param column: the column in which the filtered subgroup is to be placed  
@return: true if there is already an element and filtered subgroup has to be moved  
*findDown*: determine if a filter element already exists in the row where filtered subgroup is to be placed  
@param row: the row in which the filtered subgroup is to be placed  
@param column: the column in which the filtered subgroup is to be placed  
@return: true if there is already an element and filtered subgroup has to be moved  
*uniq_fast*: removes duplicates from an array  
@param a: the array to be processed  
@return: the array without duplicates  

###directives/barchart.directive.js  
See http://bost.ocks.org/mike/bar/3/ and previous sections of the shown tutorial.  

###directives/graph.directive.js  
See http://bl.ocks.org/d3noob/b3ff6ae1c120eea654b5.  

###directives/filterbar.directive.js  
The filterbar is used to display the filtering history and the subgroups it creates.  
The underlying data structure is therefore the list of subgroups mentioned in the data service section before. Subgroups can be selected by clicking the corresponding filter element in the filterbar. There is always one selected subgroup at a time. These selections are used for exporting subgroup data.
For each of these subgroups a row and a column index is stored which indicates the position of this subgroup inside of the filtering history which is organized in terms of a matrix. How do we get this row and column indices for a subgroup? The arrangement of the filter elements works as follows:  
A subgroup resulting from filtering is placed to the right of the subgroup "von der aus gefiltert wurde, dem Vorgänger". If two ore more subgroups are created based on the same predecessor then the second and following filter elements are also placed to the right of the predecessor but respectively a row below. Connecting lines illustrate the correlations between filter elements. Thus, for each created subgroup we know the predecessor and possible successor subgroups. This leads to a filter path showing the process that was passed through on the way to creating a specific subgroup. Clicking on a filter element leads to a shrinking of irrelevant elements while all the subgroups that lie on this path or more precisely that were involved creating the specific subgroup remain big.  

#####Functions
*update*: shrinks filter elements that do not lie on the current filter path  
@param element: the filter element that was lastly added via filtering  
*wrap*: wraps the labels inside the filter elements (see http://bl.ocks.org/mbostock/7555321)  
@param text: the label text that needs to be wrapped  
@param width: the width of the filter element that should not be exceeded  
@param height: the height of the filter element that should not be exceeded  
*click*: processes the click of a filter element. If a small element is clicked then this and the other elements on the filter path are displayed big. Sets the corresponding subgroup active and triggers the update of progessbar and subdivided barchart.  
@param d: the clicked element  
*saveSub*: triggers the export of the currently selected subgroup  
*setActive*: sets an element and its corresponding subgroup selected for further processing  
@param element: the element to be selected  
*computeYPosition*: determines the vertical position of the given element  
@param d: the subgroup corresponding to the element whose y-coordinate is to be computed
@param path: the list of subgroups, that are on the filter path of the given element  
@return: the y-coordinate of the element  
*computeHeight*: determines the height of a given element (depending on whether the element is among the filter path)  
@param d: the subgroup corresponding to the element whose height is to be computed  
@param path: the list of subgroups, that are on the filter path of the given element
@return: the height of the element  

###directives/searchbar.directive.js  
The search field was implemented by adapting the code of the D3 autocomplete component example. It can be seen at http://www.brightpointinc.com/clients/brightpointinc.com/library/autocomplete/index.html?source=d3js.

###directives/tree.directive.js  
The tree layout was implemented using the Collapsible Tree of the D3 library (for the example code see http://bl.ocks.org/mbostock/4339083).  
A tree consists of nodes that represent the data and links that represent the hierarchy.  
A node has a *name* e.g. "Study", a *depth* e.g. 1 and an *id* e.g. 10. Its *x and y coordinates* are also stored as well as the *parent* node.
One can also access the children of a given node through *\_children*. This gives not the node itself as a tree node but the name and size as stored in the json file.  
The nodes are labelled as inner nodes and leaf nodes according to their position inside the tree. The inner nodes are the categories and the leaf nodes are the attributes themselves. Each node is represented by a circle and a label and the leaf nodes additionally have a small multiple (example code at http://bl.ocks.org/mbostock/1157787) representing the distribution of the bound attribute.  
A link has a *source* and a *target* node and can directly be styled using the css style attribute.  
As the tree layout is used to only represent a list of attributes classified into categories the root node is not needed and therefore hidden by just setting the *hidden* attribute of the root node to true.  

#####Functions  
Controller function: creates and updates the tree layout  
*collapse*: close an open node on click by transition of its child nodes  
@param d: the node whose children are translated  
*update*: renders the tree and corresponding barcharts/graphs when a node was clicked. Taking the clicked node as the root, the tree layout is computed from there on.  
@param source: the clicked node that is taken as the root for the updated tree  
*mouseover*: enhances the corresponding link of the hovered node. If it is a leaf node the node itself is also enhanced (see http://stackoverflow.com/questions/19111581/d3js-force-directed-on-hover-to-node-highlight-colourup-linked-nodes-and-link).  
@param d: the hovered node  
*mouseout*: resets the previously enhanced link and node to their default style  
@param d: the node that was left by the mouse  
*click*: opens or rather closes a node (according to its state) by setting child nodes and triggers the update of the resulting tree  
@param d: the clicked node

-----------------

Future Work
==============

###directives/barchart.directive.js  
The labels of the x axis are way too long and need to be wrapped or cropped. At the moment they are rotated by 45 degrees to prevent overlapping but they still
cannot be seen at their whole length. Either they are wrapped to fit on multiple lines (see http://bl.ocks.org/mbostock/7555321) or they are cropped at a specific length or one establishes abbreviations for each label.  

###directives/graph.directive.js  
In order to make the numerical attributes and therefore the graph visualizations applicable for filtering a discretization is needed.  
This could be implemented using lines (german: Geraden) that separate the co-domain (german: Wertebereich) into several sections. These sections can then be used for filtering, e.g. the attribute "Age" with the sections "0-20", "20-40", "40-60", ... .  
The sections are created by shifting the lines along the x-axis or simply entering the desired value in an input field. Initially one line is existent in the graph visualization, by clicking a "+"-button the user can add as many lines as he needs.  
The discretization can be saved by creating a new quantitative (im Sinne von: diskrete Ausprägungen, die in eine Reihenfolge gebracht werden können) attribute out of the defined sections. This quantitative attribute can then be used for filtering in the known manner.  
Positioning the lines could be facilitated by providing functionalities like snapping lines to specific predefined positions or a tool to directly divide the co-domain in a certain number of equal sections.

###directives/filterbar.directive.js
At the moment it is only possible to create a subgroup by filtering according to one single attribute. Filtering according to a query containing multiple attributes e.g. "Age > 50 and Living_with_Partner yes" is done sequentially. But sometimes it might be the case that the user previously knows that he only needs the subgroup that fulfills both criteria without having the subgroups in between. It then could be useful to provide the functionality to filter according to several attributes at the same time to avoid creating non-essential subgroups.  
It might also be useful to allow subgroups and therefore filter processes to be removed. In this case one has to think of how to deal with following subgroups that were filtered based on the removed subgroup. Furthermore the possibility to reset the whole filterbar without having to reload the page could be offered.
The labels are wrapped in the svg rectangles belonging to the filter elements using a function that divides a label into its single words and then adds the words to a line as long as the given width is not exceeded. If this is the case a new line is started. It also simply crops the label if the given height is exceeded.  
If a small filter element (with hidden label) is clicked the update function is executed with this filter element as input and the wrap function is executed a second time for the belonging label. This leads to wrong outcomes because the input text of the label now somehow has another composition which results in missing empty spaces and wrong positions for the line break.  

###directives/tree.directive.js
At the moment the position and the width and height of the small multiples are fixed. This leads to overlaps when many of the inner nodes of the tree layout are opened because there is not enough vertical space for all of the multiples to fit in without overlapping. Therefore the height and position of the small multiples needs to be dynamically adapted according to the number of leaf nodes that are currently displayed.  
It can also be considered to add the subdivided bars known from the barchart to the small multiples.  

###Graphical User Interface  
Remove border lines and place components closer to each other to make it look less like a prototype. Use the law of proximity to achieve an impression of togetherness/cohesion.  
To achieve a more responsive design of the visualizations themselves one could use the bootstrap grid layout to place for example the tree layout instead of setting negative margins as it is handled at the moment. Otherwise the overall layout is responsive but the visualizations themselves are adjusted to one specific display ratio.  
In general, the layout of the interface can be improved towards a more attractive design.  
