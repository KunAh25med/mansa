
/* =========================================================
   PITCHGRID
   SPATIAL FOOTBALL ANALYTICS ENGINE
========================================================= */


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

var map = null;

var zonesLayer = null;

var channelsLayer = null;

var shotConeLayer = null;

var analysisLayer = null;

var gridActive = false;

var channelsActive = false;

var shotConeActive = false;

var currentMode = 'fan';

var currentAnalysis = 'fullback_overlap';



/* =========================================================
   ANALYSIS REGISTRY
========================================================= */

var analysisRegistry = {

    fullback_overlap: {

        title:
            'Fullback Defensive Exposure',

        description:
            'The right-back is spatially exposed as the defensive structure stretches toward the attacking player. The exposure corridor creates a measurable gap between the fullback and the nearest central defender.',

        area:
            '642 m²',

        exposure:
            '9.8 m',

        nearest:
            '12.4 m'

    },


    compactness: {

        title:
            'Defensive Compactness',

        description:
            'The defensive block is represented as a spatial structure. Distances between defenders can be measured to identify how tightly the team is maintaining its defensive shape.',

        area:
            '518 m²',

        exposure:
            '6.2 m',

        nearest:
            '8.7 m'

    },


    equality: {

        title:
            'Spatial Equality',

        description:
            'Spatial equality examines how players share and contest the same football space. The analysis can identify numerical equality, 1v1 situations and areas where one team gains spatial advantage.',

        area:
            '384 m²',

        exposure:
            '5.1 m',

        nearest:
            '6.8 m'

    },


    voronoi: {

        title:
            'Spatial Control',

        description:
            'Voronoi-style spatial partitioning can estimate the area controlled or influenced by individual players based on their relative proximity to surrounding players.',

        area:
            '731 m²',

        exposure:
            '4.6 m',

        nearest:
            '7.9 m'

    },


    nearest_defender: {

        title:
            'Nearest Defender',

        description:
            'Measures the spatial relationship between an attacking player and the nearest available defender.',

        area:
            '296 m²',

        exposure:
            '4.2 m',

        nearest:
            '6.3 m'

    },


    distance_analysis: {

        title:
            'Distance Analysis',

        description:
            'Measures direct spatial distance between selected football objects using Euclidean spatial geometry.',

        area:
            '410 m²',

        exposure:
            '7.4 m',

        nearest:
            '9.1 m'

    },


    defensive_shape: {

        title:
            'Defensive Shape',

        description:
            'Represents the defensive structure as a spatial polygon to understand the geometry of the defensive block.',

        area:
            '1,248 m²',

        exposure:
            '8.2 m',

        nearest:
            '10.6 m'

    },


    exposure_zone: {

        title:
            'Exposure Zone',

        description:
            'Identifies an area where the defensive structure becomes vulnerable because of spacing, player positioning and available attacking space.',

        area:
            '354 m²',

        exposure:
            '10.1 m',

        nearest:
            '11.8 m'

    }

};



/* =========================================================
   ENTER EXPERIENCE
========================================================= */

function enterExperience(mode) {

    currentMode = mode || 'fan';


    var intro =
        document.getElementById(
            'introPage'
        );


    var dashboard =
        document.getElementById(
            'dashboardPage'
        );


    if (!intro || !dashboard) {

        console.error(
            'PitchGrid pages not found.'
        );

        return;

    }


    intro.classList.add(
        'hidden'
    );


    dashboard.classList.remove(
        'hidden'
    );


    var modeDisplay =
        document.getElementById(
            'modeDisplay'
        );


    if (modeDisplay) {

        if (currentMode === 'coach') {

            modeDisplay.innerHTML = `

                <i class="fa-solid fa-crosshairs"></i>

                <span>
                    FOR COACHES
                </span>

            `;

        } else {

            modeDisplay.innerHTML = `

                <i class="fa-solid fa-futbol"></i>

                <span>
                    FOR FANS
                </span>

            `;

        }

    }


    /*
       Important:
       Leaflet map is initialized AFTER
       dashboard becomes visible.
    */

    setTimeout(
        function () {

            initializePitchGrid();

        },
        200
    );

}



/* =========================================================
   BACK TO INTRO
========================================================= */

function backToIntro() {

    var intro =
        document.getElementById(
            'introPage'
        );


    var dashboard =
        document.getElementById(
            'dashboardPage'
        );


    if (!intro || !dashboard) {

        return;

    }


    dashboard.classList.add(
        'hidden'
    );


    intro.classList.remove(
        'hidden'
    );

}



/* =========================================================
   INITIALIZE MAP
========================================================= */

function initializePitchGrid() {


    if (map) {

        map.invalidateSize();

        return;

    }


    if (typeof L === 'undefined') {

        alert(
            'Leaflet could not be loaded.'
        );

        console.error(
            'Leaflet library is missing.'
        );

        return;

    }


    /* =====================================================
       MAP
    ===================================================== */

    map = L.map(

        'map',

        {

            crs:
                L.CRS.Simple,

            minZoom:
                -1,

            maxZoom:
                2,

            zoomControl:
                false,

            attributionControl:
                false

        }

    );


    /* =====================================================
       FIFA BOUNDS
    ===================================================== */

    var bounds = [

        [0, 0],

        [68, 105]

    ];


    map.fitBounds(
        bounds
    );



    /* =====================================================
       CUSTOM CONTROLS
    ===================================================== */

    var customControls =
        L.control({

            position:
                'topleft'

        });


    customControls.onAdd =
        function () {

            var div =
                L.DomUtil.create(

                    'div',

                    'leaflet-control-custom-group'

                );


            div.innerHTML = `

                <button
                    class="leaflet-control-btn"
                    title="Zoom In"
                    onclick="map.zoomIn()">

                    +

                </button>


                <button
                    class="leaflet-control-btn"
                    title="Zoom Out"
                    onclick="map.zoomOut()">

                    −

                </button>


                <button
                    class="leaflet-control-btn"
                    title="Reset Extent"
                    onclick="map.fitBounds([[0,0],[68,105]])"
                    style="font-size:16px;">

                    ⤢

                </button>

            `;


            return div;

        };


    customControls.addTo(
        map
    );



    /* =====================================================
       POSTGIS BADGE
    ===================================================== */

    var postgisBadge =
        L.control({

            position:
                'topright'

        });


    postgisBadge.onAdd =
        function () {

            var div =
                L.DomUtil.create(

                    'div',

                    'postgis-badge-control'

                );


            div.innerHTML = `

                <span class="postgis-icon"></span>

                PostGIS Engine • SRID 0

            `;


            return div;

        };


    postgisBadge.addTo(
        map
    );



    /* =====================================================
       PITCH STYLES
    ===================================================== */

    var lineStyle = {

        color:
            '#0f172a',

        weight:
            2,

        fill:
            false

    };


    var markStyle = {

        color:
            '#0f172a',

        weight:
            1.5

    };



    /* =====================================================
       PITCH
    ===================================================== */

    L.rectangle(

        [[0, 0], [68, 105]],

        {

            color:
                '#0f172a',

            weight:
                2.5,

            fillColor:
                '#ffffff',

            fillOpacity:
                1

        }

    ).addTo(map);



    /* =====================================================
       CENTER LINE
    ===================================================== */

    L.polyline(

        [[0, 52.5], [68, 52.5]],

        lineStyle

    ).addTo(map);



    /* =====================================================
       CENTER CIRCLE
    ===================================================== */

    L.circle(

        [34, 52.5],

        {

            radius:
                9.15,

            color:
                '#0f172a',

            weight:
                2,

            fill:
                false

        }

    ).addTo(map);


    L.circle(

        [34, 52.5],

        {

            radius:
                0.3,

            fillColor:
                '#0f172a',

            fill:
                true,

            color:
                '#0f172a'

        }

    ).addTo(map);



    /* =====================================================
       LEFT PENALTY
    ===================================================== */

    L.rectangle(

        [[13.85, 0], [54.15, 16.5]],

        lineStyle

    ).addTo(map);


    L.rectangle(

        [[24.85, 0], [43.15, 5.5]],

        lineStyle

    ).addTo(map);


    L.circle(

        [34, 11],

        {

            radius:
                0.3,

            fillColor:
                '#0f172a',

            fill:
                true,

            color:
                '#0f172a'

        }

    ).addTo(map);



    /* =====================================================
       LEFT ARC
    ===================================================== */

    var leftArcCoords = [];


    for (
        var angle = -53;
        angle <= 53;
        angle++
    ) {

        var rad =
            angle *
            Math.PI /
            180;


        leftArcCoords.push([

            34 +
            9.15 *
            Math.sin(rad),

            11 +
            9.15 *
            Math.cos(rad)

        ]);

    }


    L.polyline(

        leftArcCoords,

        lineStyle

    ).addTo(map);



    /* =====================================================
       RIGHT PENALTY
    ===================================================== */

    L.rectangle(

        [[13.85, 88.5], [54.15, 105]],

        lineStyle

    ).addTo(map);


    L.rectangle(

        [[24.85, 99.5], [43.15, 105]],

        lineStyle

    ).addTo(map);


    L.circle(

        [34, 94],

        {

            radius:
                0.3,

            fillColor:
                '#0f172a',

            fill:
                true,

            color:
                '#0f172a'

        }

    ).addTo(map);



    /* =====================================================
       RIGHT ARC
    ===================================================== */

    var rightArcCoords = [];


    for (
        var angle = 127;
        angle <= 233;
        angle++
    ) {

        var rad =
            angle *
            Math.PI /
            180;


        rightArcCoords.push([

            34 +
            9.15 *
            Math.sin(rad),

            94 +
            9.15 *
            Math.cos(rad)

        ]);

    }


    L.polyline(

        rightArcCoords,

        lineStyle

    ).addTo(map);



    /* =====================================================
       GOALS
    ===================================================== */

    L.rectangle(

        [[30.34, -2], [37.66, 0]],

        {

            color:
                '#0f172a',

            weight:
                1.8,

            fillColor:
                '#f1f5f9',

            fillOpacity:
                .8

        }

    ).addTo(map);


    L.rectangle(

        [[30.34, 105], [37.66, 107]],

        {

            color:
                '#0f172a',

            weight:
                1.8,

            fillColor:
                '#f1f5f9',

            fillOpacity:
                .8

        }

    ).addTo(map);



    /* =====================================================
       CORNERS
    ===================================================== */

    L.polyline(

        [[1, 0], [0, 1]],

        markStyle

    ).addTo(map);


    L.polyline(

        [[67, 0], [68, 1]],

        markStyle

    ).addTo(map);


    L.polyline(

        [[0, 104], [1, 105]],

        markStyle

    ).addTo(map);


    L.polyline(

        [[68, 104], [67, 105]],

        markStyle

    ).addTo(map);



    /* =====================================================
       CORNER MARKS
    ===================================================== */

    L.polyline(

        [[-1.5, 9.15], [0, 9.15]],

        markStyle

    ).addTo(map);


    L.polyline(

        [[68, 9.15], [69.5, 9.15]],

        markStyle

    ).addTo(map);


    L.polyline(

        [[-1.5, 95.85], [0, 95.85]],

        markStyle

    ).addTo(map);


    L.polyline(

        [[68, 95.85], [69.5, 95.85]],

        markStyle

    ).addTo(map);



    /* =====================================================
       SCALE HUD
    ===================================================== */

    var scaleHud =
        L.control({

            position:
                'bottomleft'

        });


    scaleHud.onAdd =
        function () {

            var div =
                L.DomUtil.create(

                    'div',

                    'scale-hud'

                );


            div.innerHTML = `

                <div style="
                    display:flex;
                    align-items:center;
                    gap:5px;
                ">

                    <div
                        class="scale-bar-graphic"
                    ></div>

                    <span>
                        <b>10m</b>
                    </span>

                </div>

                <span style="
                    color:#cbd5e1;
                ">
                    |
                </span>

                <span>
                    Attack ➔
                </span>

            `;


            return div;

        };


    scaleHud.addTo(
        map
    );



    /* =====================================================
       COORDINATES
    ===================================================== */

    var coordsHud =
        L.control({

            position:
                'bottomright'

        });


    coordsHud.onAdd =
        function () {

            var div =
                L.DomUtil.create(

                    'div',

                    'coords-hud'

                );


            div.id =
                'live-coords';


            div.innerHTML =
                'X: <b>0.00m</b> | Y: <b>0.00m</b>';


            return div;

        };


    coordsHud.addTo(
        map
    );



    /* =====================================================
       MOUSE X/Y
    ===================================================== */

    map.on(

        'mousemove',

        function (e) {

            var x =
                Math.max(
                    0,
                    Math.min(
                        105,
                        e.latlng.lng
                    )
                ).toFixed(2);


            var y =
                Math.max(
                    0,
                    Math.min(
                        68,
                        e.latlng.lat
                    )
                ).toFixed(2);


            var coords =
                document.getElementById(
                    'live-coords'
                );


            if (coords) {

                coords.innerHTML =
                    `X: <b>${x}m</b> | Y: <b>${y}m</b>`;

            }

        }

    );



    /* =====================================================
       GRID
    ===================================================== */

    zonesLayer =
        L.layerGroup();


    [
        13.85,
        24.85,
        43.15,
        54.15

    ].forEach(

        function (y) {

            L.polyline(

                [[y, 0], [y, 105]],

                {

                    color:
                        '#94a3b8',

                    weight:
                        1,

                    dashArray:
                        '3, 3'

                }

            ).addTo(
                zonesLayer
            );

        }

    );


    [
        16.5,
        33.0,
        52.5,
        72.0,
        88.5

    ].forEach(

        function (x) {

            L.polyline(

                [[0, x], [68, x]],

                {

                    color:
                        '#94a3b8',

                    weight:
                        1,

                    dashArray:
                        '3, 3'

                }

            ).addTo(
                zonesLayer
            );

        }

    );



    /* =====================================================
       CHANNELS
    ===================================================== */

    channelsLayer =
        L.layerGroup();


    [
        13.85,
        24.85,
        43.15,
        54.15

    ].forEach(

        function (y) {

            L.polyline(

                [[y, 0], [y, 105]],

                {

                    color:
                        '#0284c7',

                    weight:
                        1.5,

                    dashArray:
                        '4, 4'

                }

            ).addTo(
                channelsLayer
            );

        }

    );


    L.rectangle(

        [[24.85, 72], [43.15, 88.5]],

        {

            color:
                '#0284c7',

            fillColor:
                '#38bdf8',

            fillOpacity:
                .25,

            weight:
                1.5

        }

    ).addTo(
        channelsLayer
    );


    /* =====================================================
       CHANNEL LABELS
    ===================================================== */

    addZoneLabel(
        [34, 80.25],
        'Zone 14',
        true
    );


    addZoneLabel(
        [60, 52.5],
        'Left Wing'
    );


    addZoneLabel(
        [48.65, 52.5],
        'Left Half-Space'
    );


    addZoneLabel(
        [34, 52.5],
        'Central Channel'
    );


    addZoneLabel(
        [19.35, 52.5],
        'Right Half-Space'
    );


    addZoneLabel(
        [8, 52.5],
        'Right Wing'
    );



    /* =====================================================
       SHOT CONE
    ===================================================== */

    shotConeLayer =
        L.layerGroup();


    setupShotAngle();



    /* =====================================================
       DEMO ANALYSIS
    ===================================================== */

    buildAnalysisLayers();


    /*
       Start with Fullback Exposure
    */

    showAnalysis(
        'fullback_overlap'
    );


    /*
       Make sure Leaflet calculates
       the correct visible size.
    */

    setTimeout(

        function () {

            map.invalidateSize();

        },

        100

    );


    console.log(
        'PitchGrid Spatial Engine Ready.'
    );

}



/* =========================================================
   ADD ZONE LABEL
========================================================= */

function addZoneLabel(
    position,
    text,
    highlight
) {

    if (!channelsLayer) return;


    L.marker(

        position,

        {

            icon:
                L.divIcon({

                    className:
                        highlight
                            ? 'zone-highlight-label'
                            : 'zone-label',

                    html:
                        text,

                    iconSize:
                        null

                })

        }

    ).addTo(
        channelsLayer
    );

}



/* =========================================================
   GRID
========================================================= */

function toggleTacticalGrid() {

    if (!map || !zonesLayer) {

        return;

    }


    gridActive =
        !gridActive;


    var button =
        document.getElementById(
            'gridBtn'
        );


    if (button) {

        button.classList.toggle(
            'active',
            gridActive
        );

    }


    if (gridActive) {

        map.addLayer(
            zonesLayer
        );

    } else {

        map.removeLayer(
            zonesLayer
        );

    }

}



/* =========================================================
   CHANNELS
========================================================= */

function toggle5Channels() {

    if (!map || !channelsLayer) {

        return;

    }


    channelsActive =
        !channelsActive;


    var button =
        document.getElementById(
            'channelsBtn'
        );


    if (button) {

        button.classList.toggle(
            'active',
            channelsActive
        );

    }


    if (channelsActive) {

        map.addLayer(
            channelsLayer
        );

    } else {

        map.removeLayer(
            channelsLayer
        );

    }

}



/* =========================================================
   SHOT ANGLE SETUP
========================================================= */

function setupShotAngle() {

    if (!map || !shotConeLayer) {

        return;

    }


    map.on(

        'click',

        function (e) {

            if (!shotConeActive) {

                return;

            }


            shotConeLayer.clearLayers();


            var x =
                e.latlng.lng;


            var y =
                e.latlng.lat;


            var targetGoalX =
                x >= 52.5
                    ? 105
                    : 0;


            var goalName =
                targetGoalX === 105
                    ? 'Right Goal'
                    : 'Left Goal';


            var goalY1 =
                30.34;


            var goalY2 =
                37.66;


            var goalCenterY =
                34;


            var dist =
                Math.sqrt(

                    Math.pow(
                        targetGoalX - x,
                        2
                    )

                    +

                    Math.pow(
                        goalCenterY - y,
                        2
                    )

                ).toFixed(2);


            var a =
                Math.sqrt(

                    Math.pow(
                        targetGoalX - x,
                        2
                    )

                    +

                    Math.pow(
                        goalY1 - y,
                        2
                    )

                );


            var b =
                Math.sqrt(

                    Math.pow(
                        targetGoalX - x,
                        2
                    )

                    +

                    Math.pow(
                        goalY2 - y,
                        2
                    )

                );


            var c =
                7.32;


            var cosine =
                (

                    Math.pow(a, 2)

                    +

                    Math.pow(b, 2)

                    -

                    Math.pow(c, 2)

                )

                /

                (

                    2 * a * b

                );


            cosine =
                Math.max(
                    -1,
                    Math.min(
                        1,
                        cosine
                    )
                );


            var angle =
                (

                    Math.acos(
                        cosine
                    )

                    *

                    180

                    /

                    Math.PI

                ).toFixed(1);



            /* SHOT CONE */

            L.polygon(

                [

                    [y, x],

                    [goalY1, targetGoalX],

                    [goalY2, targetGoalX]

                ],

                {

                    color:
                        '#0284c7',

                    fillColor:
                        '#38bdf8',

                    fillOpacity:
                        .35,

                    weight:
                        2

                }

            ).addTo(
                shotConeLayer
            );



            /* SHOT POINT */

            var marker =
                L.circleMarker(

                    [y, x],

                    {

                        radius:
                            6,

                        fillColor:
                            '#f43f5e',

                        color:
                            '#ffffff',

                        weight:
                            2,

                        fillOpacity:
                            1

                    }

                ).addTo(
                    shotConeLayer
                );


            marker.bindPopup(`

                <div class="shot-popup-content">

                    <div class="shot-popup-title">

                        🎯 Shot Metrics

                        (${goalName})

                    </div>


                    <div>

                        Coordinates:

                        <b>

                            X:
                            ${x.toFixed(1)}m,

                            Y:
                            ${y.toFixed(1)}m

                        </b>

                    </div>


                    <div>

                        Dist to Goal:

                        <span class="shot-val">

                            ${dist} m

                        </span>

                    </div>


                    <div>

                        Shot Angle:

                        <span class="shot-val">

                            ${angle}°

                        </span>

                    </div>

                </div>

            `).openPopup();

        }

    );

}



/* =========================================================
   TOGGLE SHOT ANGLE
========================================================= */

function toggleShotCone() {

    if (!map || !shotConeLayer) {

        return;

    }


    shotConeActive =
        !shotConeActive;


    var button =
        document.getElementById(
            'coneBtn'
        );


    if (button) {

        button.classList.toggle(
            'active',
            shotConeActive
        );

    }


    if (!shotConeActive) {

        shotConeLayer.clearLayers();

    }

}



/* =========================================================
   ANALYSIS LAYERS
========================================================= */

function buildAnalysisLayers() {

    if (!map) {

        return;

    }


    analysisLayer =
        L.layerGroup();


    /* =====================================================
       FULLBACK EXPOSURE
    ===================================================== */

    L.polygon(

        [

            [21, 77],

            [32, 88],

            [46, 94],

            [54, 88],

            [40, 76]

        ],

        {

            color:
                '#f43f5e',

            fillColor:
                '#fb7185',

            fillOpacity:
                .18,

            weight:
                2

        }

    ).bindPopup(

        '<b>Fullback Exposure</b><br>' +

        'Exposure corridor: 9.8m'

    ).addTo(
        analysisLayer
    );


    L.polyline(

        [

            [32, 88],

            [40, 76]

        ],

        {

            color:
                '#f43f5e',

            weight:
                3,

            dashArray:
                '6,4'

        }

    ).addTo(
        analysisLayer
    );



    /* =====================================================
       COMPACTNESS
    ===================================================== */

    L.polygon(

        [

            [20, 30],

            [28, 42],

            [39, 48],

            [49, 43],

            [55, 32],

            [45, 25]

        ],

        {

            color:
                '#0284c7',

            fillColor:
                '#38bdf8',

            fillOpacity:
                .15,

            weight:
                2

        }

    ).bindPopup(

        '<b>Defensive Compactness</b><br>' +

        'Compactness area: 518m²'

    ).addTo(
        analysisLayer
    );



    /* =====================================================
       EQUALITY
    ===================================================== */

    L.circle(

        [34, 67],

        {

            radius:
                9,

            color:
                '#7c3aed',

            fillColor:
                '#a78bfa',

            fillOpacity:
                .15,

            weight:
                2

        }

    ).addTo(
        analysisLayer
    );


    L.polyline(

        [

            [34, 58],

            [34, 76]

        ],

        {

            color:
                '#7c3aed',

            weight:
                2,

            dashArray:
                '5,4'

        }

    ).addTo(
        analysisLayer
    );



    /* =====================================================
       VORONOI STYLE
    ===================================================== */

    var cells = [

        [

            [14, 66],

            [14, 78],

            [30, 72],

            [34, 66]

        ],


        [

            [30, 72],

            [34, 66],

            [54, 72],

            [54, 80],

            [38, 78]

        ],


        [

            [14, 78],

            [14, 90],

            [34, 90],

            [38, 78],

            [30, 72]

        ]

    ];


    cells.forEach(

        function (cell) {

            L.polygon(

                cell,

                {

                    color:
                        '#0ea5e9',

                    fillColor:
                        '#38bdf8',

                    fillOpacity:
                        .12,

                    weight:
                        1.5

                }

            ).addTo(
                analysisLayer
            );

        }

    );



    /* =====================================================
       NEAREST DEFENDER
    ===================================================== */

    L.polyline(

        [

            [36, 79],

            [41, 68]

        ],

        {

            color:
                '#f59e0b',

            weight:
                3,

            dashArray:
                '6,4'

        }

    ).addTo(
        analysisLayer
    );


    L.circleMarker(

        [36, 79],

        {

            radius:
                6,

            color:
                '#ffffff',

            weight:
                2,

            fillColor:
                '#f59e0b',

            fillOpacity:
                1

        }

    ).addTo(
        analysisLayer
    );


    L.circleMarker(

        [41, 68],

        {

            radius:
                6,

            color:
                '#ffffff',

            weight:
                2,

            fillColor:
                '#0284c7',

            fillOpacity:
                1

        }

    ).addTo(
        analysisLayer
    );



    /* =====================================================
       DISTANCE
    ===================================================== */

    L.polyline(

        [

            [24, 61],

            [48, 82]

        ],

        {

            color:
                '#10b981',

            weight:
                3,

            dashArray:
                '5,4'

        }

    ).addTo(
        analysisLayer
    );



    /* =====================================================
       DEFENSIVE SHAPE
    ===================================================== */

    L.polygon(

        [

            [17, 35],

            [24, 45],

            [38, 50],

            [52, 44],

            [59, 34],

            [48, 28],

            [31, 27]

        ],

        {

            color:
                '#334155',

            fillColor:
                '#64748b',

            fillOpacity:
                .13,

            weight:
                2

        }

    ).addTo(
        analysisLayer
    );



    /* =====================================================
       EXPOSURE ZONE
    ===================================================== */

    L.rectangle(

        [[18, 82], [51, 96]],

        {

            color:
                '#ef4444',

            fillColor:
                '#f87171',

            fillOpacity:
                .13,

            weight:
                2,

            dashArray:
                '7,5'

        }

    ).addTo(
        analysisLayer
    );

}



/* =========================================================
   SHOW ANALYSIS
========================================================= */

function showAnalysis(
    analysisId
) {

    if (!analysisRegistry[analysisId]) {

        return;

    }


    currentAnalysis =
        analysisId;


    var data =
        analysisRegistry[
            analysisId
        ];


    /* =====================================================
       TITLE
    ===================================================== */

    var title =
        document.getElementById(
            'analysisTitle'
        );


    if (title) {

        title.textContent =
            data.title;

    }


    var pitchTitle =
        document.getElementById(
            'pitchTitle'
        );


    if (pitchTitle) {

        pitchTitle.textContent =
            data.title;

    }


    /* =====================================================
       DESCRIPTION
    ===================================================== */

    var description =
        document.getElementById(
            'analysisDescription'
        );


    if (description) {

        description.textContent =
            data.description;

    }


    /* =====================================================
       CHAT RESPONSE
    ===================================================== */

    addBotMessage(
        data.title,
        data.description
    );


    /* =====================================================
       ANALYSIS LAYER
    ===================================================== */

    if (map && analysisLayer) {

        if (!map.hasLayer(
            analysisLayer
        )) {

            map.addLayer(
                analysisLayer
            );

        }

    }

}



/* =========================================================
   REQUEST ANALYSIS
========================================================= */

function requestAnalysis(
    analysisId
) {

    showAnalysis(
        analysisId
    );

}



/* =========================================================
   BOT MESSAGE
========================================================= */

function addBotMessage(
    title,
    description
) {

    var chat =
        document.getElementById(
            'chatMessages'
        );


    if (!chat) {

        return;

    }


    /*
       Don't create too many identical
       welcome responses.
    */

    var message =
        document.createElement(
            'div'
        );


    message.className =
        'bot-message';


    message.innerHTML = `

        <div class="bot-avatar">

            <i class="fa-solid fa-brain"></i>

        </div>


        <div class="message-content">

            <span class="message-label">

                PITCHGRID ENGINE

            </span>


            <p>

                <strong>
                    ${title}
                </strong>

            </p>


            <p>

                ${description}

            </p>

        </div>

    `;


    chat.appendChild(
        message
    );


    chat.scrollTop =
        chat.scrollHeight;

}



/* =========================================================
   CHAT
========================================================= */

function sendChatMessage() {

    var input =
        document.getElementById(
            'chatInput'
        );


    if (!input) {

        return;

    }


    var query =
        input.value.trim();


    if (!query) {

        return;

    }


    input.value = '';


    var normalized =
        query.toLowerCase();


    var analysisId =
        null;


    if (

        normalized.includes(
            'fullback'
        )

        ||

        normalized.includes(
            'overlap'
        )

        ||

        normalized.includes(
            'exposure'
        )

    ) {

        analysisId =
            'fullback_overlap';

    }


    else if (

        normalized.includes(
            'compact'
        )

    ) {

        analysisId =
            'compactness';

    }


    else if (

        normalized.includes(
            'equality'
        )

        ||

        normalized.includes(
            'duel'
        )

        ||

        normalized.includes(
            '1v1'
        )

    ) {

        analysisId =
            'equality';

    }


    else if (

        normalized.includes(
            'voronoi'
        )

        ||

        normalized.includes(
            'control'
        )

    ) {

        analysisId =
            'voronoi';

    }


    else if (

        normalized.includes(
            'nearest'
        )

    ) {

        analysisId =
            'nearest_defender';

    }


    else if (

        normalized.includes(
            'distance'
        )

    ) {

        analysisId =
            'distance_analysis';

    }


    else if (

        normalized.includes(
            'shape'
        )

    ) {

        analysisId =
            'defensive_shape';

    }


    else if (

        normalized.includes(
            'zone'
        )

    ) {

        analysisId =
            'exposure_zone';

    }


    if (analysisId) {

        requestAnalysis(
            analysisId
        );

    }

    else {

        addBotMessage(

            'Spatial Query',

            'I can analyze Fullback Exposure, Defensive Compactness, Spatial Equality, Spatial Control, Nearest Defender, Distance, Defensive Shape and Exposure Zones.'

        );

    }

}



/* =========================================================
   ENTER KEY
========================================================= */

document.addEventListener(

    'DOMContentLoaded',

    function () {

        var input =
            document.getElementById(
                'chatInput'
            );


        if (input) {

            input.addEventListener(

                'keydown',

                function (event) {

                    if (
                        event.key === 'Enter'
                    ) {

                        event.preventDefault();

                        sendChatMessage();

                    }

                }

            );

        }

    }

);



/* =========================================================
   GLOBAL DEBUG
========================================================= */

console.log(
    'PitchGrid JS loaded.'
);

/* =========================================================
   PITCHGRID NEW ANALYSIS WORKSPACE
   BRIDGE LAYER
   Works with the existing PitchGrid / Leaflet engine
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       STATE
    ===================================================== */

    window.pgPlayers = [];
    window.pgBall = null;

    window.pgCurrentAnalysis = null;

    window.pgPlacementMode = null;

    window.pgPlacementTeam = "HOME";

    window.pgPlayerNumber = 1;

    window.pgAnalysisResult = null;

    window.pgInteractionReady = false;


    /* =====================================================
       ANALYSIS DEFINITIONS
    ===================================================== */

    window.pgAnalyses = {

        defensive_structure: {

            title: "Defensive Structure",

            description:
                "Measures the defensive block through its spatial footprint, width, depth and compactness.",

            requirements:
                "HOME defenders · minimum 3 players",

            icon:
                "fa-draw-polygon"

        },


        defensive_gaps: {

            title: "Defensive Gaps",

            description:
                "Identifies the largest spatial separation between defenders.",

            requirements:
                "HOME defenders · minimum 2 players",

            icon:
                "fa-arrows-left-right"

        },


        defensive_coverage: {

            title: "Defensive Coverage",

            description:
                "Estimates the space protected by the defensive structure and the remaining exposed space.",

            requirements:
                "HOME defenders · minimum 2 players",

            icon:
                "fa-shield"

        },


        nearest_pressure: {

            title:
                "Nearest Defender & Pressure",

            description:
                "Measures the distance between the ball or nearest attacker and the closest defender.",

            requirements:
                "HOME defenders + Ball or AWAY attacker",

            icon:
                "fa-crosshairs"

        },


        space_between_lines: {

            title:
                "Space Between Lines",

            description:
                "Measures the playable corridor between defensive units.",

            requirements:
                "Players from both teams",

            icon:
                "fa-arrows-up-down"

        },


        attacking_space: {

            title:
                "Attacking Space",

            description:
                "Identifies available space around attacking players.",

            requirements:
                "AWAY attackers + HOME defenders",

            icon:
                "fa-vector-square"

        },


        passing_lanes: {

            title:
                "Passing Lanes",

            description:
                "Evaluates potential passing connections and whether defenders obstruct them.",

            requirements:
                "AWAY attackers + HOME defenders",

            icon:
                "fa-route"

        },


        line_break: {

            title:
                "Line Break",

            description:
                "Examines whether an attacking player can penetrate the defensive line.",

            requirements:
                "AWAY attackers + HOME defenders",

            icon:
                "fa-arrow-right"

        }

    };


    /* =====================================================
       INITIALIZE BRIDGE
    ===================================================== */

    function pgInitializeBridge() {

        if (
            document.readyState ===
            "loading"
        ) {

            document.addEventListener(
                "DOMContentLoaded",
                pgInitializeBridge
            );

            return;

        }


        pgWaitForMap();

    }


    /* =====================================================
       WAIT FOR ORIGINAL LEAFLET MAP
       IMPORTANT:
       The original JS creates #map after ENTER PITCHGRID.
    ===================================================== */

    function pgWaitForMap() {

        if (
            typeof window.map !== "undefined" &&
            window.map
        ) {

            pgSetupMapInteraction();

            return;

        }


        setTimeout(
            pgWaitForMap,
            300
        );

    }


    /* =====================================================
       MAP INTERACTION
    ===================================================== */

    function pgSetupMapInteraction() {

        if (
            window.pgInteractionReady
        ) {

            return;

        }


        if (
            !window.map
        ) {

            return;

        }


        window.pgInteractionReady = true;


        window.map.on(
            "click",
            function (event) {

                if (
                    window.pgPlacementMode ===
                    "player"
                ) {

                    pgPlacePlayer(
                        event.latlng.lng,
                        event.latlng.lat
                    );

                    return;

                }


                if (
                    window.pgPlacementMode ===
                    "ball"
                ) {

                    pgPlaceBall(
                        event.latlng.lng,
                        event.latlng.lat
                    );

                    return;

                }

            }
        );


        console.log(
            "PitchGrid Analysis Bridge Ready."
        );

    }


    /* =====================================================
       START PLAYER PLACEMENT
    ===================================================== */

    window.pgStartPlayerPlacement =
        function () {

            window.pgPlacementMode =
                "player";


            /*
               Alternate HOME / AWAY automatically.
               First player = HOME
               Second player = AWAY
            */

            window.pgPlacementTeam =
                window.pgPlayers.length % 2 === 0
                    ? "HOME"
                    : "AWAY";


            pgShowPlacementMessage(
                `Click on the pitch to place ${window.pgPlacementTeam} player`
            );

        };


    /* =====================================================
       PLACE PLAYER
    ===================================================== */

    function pgPlacePlayer(
        x,
        y
    ) {

        const team =
            window.pgPlacementTeam;


        let position =
            "PLAYER";


        let name =
            `${team} Player ${window.pgPlayerNumber}`;


        /*
           Ask only after clicking.
           Keeps the workflow simple.
        */

        const customName =
            window.prompt(
                "Player name / number:",
                name
            );


        if (
            customName &&
            customName.trim()
        ) {

            name =
                customName.trim();

        }


        const customPosition =
            window.prompt(
                "Position:",
                team === "HOME"
                    ? "CB"
                    : "FW"
            );


        if (
            customPosition &&
            customPosition.trim()
        ) {

            position =
                customPosition
                    .trim()
                    .toUpperCase();

        }


        const player = {

            id:
                "pg_player_" +
                Date.now() +
                "_" +
                window.pgPlayerNumber,

            name:
                name,

            team:
                team,

            position:
                position,

            x:
                Number(
                    x.toFixed(2)
                ),

            y:
                Number(
                    y.toFixed(2)
                )

        };


        window.pgPlayers.push(
            player
        );


        window.pgPlayerNumber++;


        window.pgPlacementMode =
            null;


        pgRenderPlayers();

        pgUpdateScenarioUI();


        pgShowPlacementMessage(
            `${name} added`
        );

    }


    /* =====================================================
       START BALL PLACEMENT
    ===================================================== */

    window.pgStartBallPlacement =
        function () {

            window.pgPlacementMode =
                "ball";


            pgShowPlacementMessage(
                "Click on the pitch to place the ball"
            );

        };


    /* =====================================================
       PLACE BALL
    ===================================================== */

    function pgPlaceBall(
        x,
        y
    ) {

        window.pgBall = {

            x:
                Number(
                    x.toFixed(2)
                ),

            y:
                Number(
                    y.toFixed(2)
                )

        };


        window.pgPlacementMode =
            null;


        pgRenderBall();

        pgUpdateScenarioUI();


        pgShowPlacementMessage(
            `Ball placed at X ${x.toFixed(1)} · Y ${y.toFixed(1)}`
        );

    }


    /* =====================================================
       PLAYER LAYER
    ===================================================== */

    let pgPlayerLayer = null;

    let pgBallLayer = null;

    let pgResultLayer = null;


    function pgCreateLayers() {

        if (
            !window.map
        ) {

            return;

        }


        if (
            !pgPlayerLayer
        ) {

            pgPlayerLayer =
                L.layerGroup()
                    .addTo(
                        window.map
                    );

        }


        if (
            !pgBallLayer
        ) {

            pgBallLayer =
                L.layerGroup()
                    .addTo(
                        window.map
                    );

        }


        if (
            !pgResultLayer
        ) {

            pgResultLayer =
                L.layerGroup()
                    .addTo(
                        window.map
                    );

        }

    }


    /* =====================================================
       RENDER PLAYERS
    ===================================================== */

    function pgRenderPlayers() {

        if (
            !window.map
        ) {

            return;

        }


        pgCreateLayers();


        pgPlayerLayer.clearLayers();


        window.pgPlayers.forEach(
            function (player) {

                const isHome =
                    player.team ===
                    "HOME";


                const marker =
                    L.circleMarker(

                        [
                            player.y,
                            player.x
                        ],

                        {

                            radius:
                                8,

                            color:
                                "#ffffff",

                            weight:
                                2,

                            fillColor:
                                isHome
                                    ? "#22d3ee"
                                    : "#fb7185",

                            fillOpacity:
                                1

                        }

                    );


                marker.bindTooltip(

                    `<strong>${pgEscape(
                        player.name
                    )}</strong><br>
                    ${pgEscape(
                        player.position
                    )}<br>
                    ${player.team}`,

                    {

                        direction:
                            "top",

                        offset:
                            [0, -8]

                    }

                );


                marker.on(
                    "click",
                    function (event) {

                        L.DomEvent.stopPropagation(
                            event
                        );


                        pgPlayerInfo(
                            player
                        );

                    }
                );


                marker.addTo(
                    pgPlayerLayer
                );


                /*
                   Player number / name
                */

                const label =
                    L.marker(

                        [
                            player.y,
                            player.x
                        ],

                        {

                            icon:
                                L.divIcon({

                                    className:
                                        "pg-player-label",

                                    html:
                                        `<span>${pgEscape(
                                            player.name
                                        )}</span>`,

                                    iconSize:
                                        null,

                                    iconAnchor:
                                        [0, 18]

                                }),

                            interactive:
                                false

                        }

                    );


                label.addTo(
                    pgPlayerLayer
                );

            }
        );

    }


    /* =====================================================
       PLAYER INFO
    ===================================================== */

    function pgPlayerInfo(
        player
    ) {

        pgShowPlacementMessage(

            `${player.name} · ${player.position} · ${player.team} · X ${player.x} · Y ${player.y}`

        );

    }


    /* =====================================================
       RENDER BALL
    ===================================================== */

    function pgRenderBall() {

        if (
            !window.map
        ) {

            return;

        }


        pgCreateLayers();


        pgBallLayer.clearLayers();


        if (
            !window.pgBall
        ) {

            return;

        }


        const ballMarker =
            L.circleMarker(

                [
                    window.pgBall.y,
                    window.pgBall.x
                ],

                {

                    radius:
                        7,

                    color:
                        "#ffffff",

                    weight:
                        3,

                    fillColor:
                        "#ffffff",

                    fillOpacity:
                        1

                }

            );


        ballMarker.bindTooltip(

            `BALL<br>
             X: ${window.pgBall.x.toFixed(1)}<br>
             Y: ${window.pgBall.y.toFixed(1)}`,

            {

                direction:
                    "top"

            }

        );


        ballMarker.addTo(
            pgBallLayer
        );

    }


    /* =====================================================
       SELECT ANALYSIS
    ===================================================== */

    window.pgSelectAnalysis =
        function (
            analysisId
        ) {

            if (
                !window.pgAnalyses[
                    analysisId
                ]
            ) {

                console.warn(
                    "Unknown PitchGrid analysis:",
                    analysisId
                );

                return;

            }


            window.pgCurrentAnalysis =
                analysisId;


            pgUpdateAnalysisButtons();


            pgUpdateSelectedAnalysis();


            /*
               Also update the original
               pitch title / insight if present.
            */

            const analysis =
                window.pgAnalyses[
                    analysisId
                ];


            const pitchTitle =
                document.getElementById(
                    "pitchTitle"
                );


            if (
                pitchTitle
            ) {

                pitchTitle.textContent =
                    analysis.title;

            }


            const oldTitle =
                document.getElementById(
                    "analysisTitle"
                );


            if (
                oldTitle
            ) {

                oldTitle.textContent =
                    analysis.title;

            }


            const oldDescription =
                document.getElementById(
                    "analysisDescription"
                );


            if (
                oldDescription
            ) {

                oldDescription.textContent =
                    analysis.description;

            }

        };


    /* =====================================================
       UPDATE SELECTED ANALYSIS
    ===================================================== */

    function pgUpdateSelectedAnalysis() {

        const analysis =
            window.pgAnalyses[
                window.pgCurrentAnalysis
            ];


        if (
            !analysis
        ) {

            return;

        }


        const title =
            document.getElementById(
                "pgSelectedAnalysisTitle"
            );


        const description =
            document.getElementById(
                "pgSelectedAnalysisDescription"
            );


        const requirements =
            document.getElementById(
                "pgAnalysisRequirements"
            );


        if (
            title
        ) {

            title.textContent =
                analysis.title;

        }


        if (
            description
        ) {

            description.textContent =
                analysis.description;

        }


        if (
            requirements
        ) {

            requirements.innerHTML = `

                <span>
                    <i class="fa-solid fa-database"></i>
                    ${pgEscape(
                        analysis.requirements
                    )}
                </span>

            `;

        }

    }


    /* =====================================================
       ACTIVE ANALYSIS BUTTON
    ===================================================== */

    function pgUpdateAnalysisButtons() {

        document
            .querySelectorAll(
                ".analysis-item"
            )
            .forEach(
                function (button) {

                    const id =
                        button.dataset.analysis;


                    button.classList.toggle(

                        "active",

                        id ===
                        window.pgCurrentAnalysis

                    );

                }
            );

    }


    /* =====================================================
       RUN ANALYSIS
    ===================================================== */

    window.pgRunAnalysis =
        function () {

            if (
                !window.pgCurrentAnalysis
            ) {

                window.pgSelectAnalysis(
                    "defensive_structure"
                );

            }


            const analysis =
                window.pgAnalyses[
                    window.pgCurrentAnalysis
                ];


            if (
                !analysis
            ) {

                return;

            }


            let result;


            switch (
                window.pgCurrentAnalysis
            ) {

                case "defensive_structure":

                    result =
                        pgAnalyzeStructure();

                    break;


                case "defensive_gaps":

                    result =
                        pgAnalyzeGaps();

                    break;


                case "defensive_coverage":

                    result =
                        pgAnalyzeCoverage();

                    break;


                case "nearest_pressure":

                    result =
                        pgAnalyzePressure();

                    break;


                case "space_between_lines":

                    result =
                        pgAnalyzeSpaceBetweenLines();

                    break;


                case "attacking_space":

                    result =
                        pgAnalyzeAttackingSpace();

                    break;


                case "passing_lanes":

                    result =
                        pgAnalyzePassingLanes();

                    break;


                case "line_break":

                    result =
                        pgAnalyzeLineBreak();

                    break;


                default:

                    result =
                        pgDemoResult();

            }


            if (
                !result
            ) {

                return;

            }


            if (
                result.error
            ) {

                pgShowInsight(
                    analysis,
                    result
                );

                return;

            }


            window.pgAnalysisResult =
                result;


            pgDrawResult(
                window.pgCurrentAnalysis,
                result
            );


            pgShowInsight(
                analysis,
                result
            );


            pgUpdateScenarioUI();


            pgShowPlacementMessage(
                "Analysis completed"
            );

        };


    /* =====================================================
       DEFENSIVE STRUCTURE
    ===================================================== */

    function pgAnalyzeStructure() {

        const defenders =
            pgHomePlayers();


        if (
            defenders.length <
            3
        ) {

            return pgInsufficient(
                "Add at least 3 HOME defenders."
            );

        }


        const points =
            defenders.map(
                function (p) {

                    return {

                        x:
                            p.x,

                        y:
                            p.y

                    };

                }
            );


        const hull =
            pgConvexHull(
                points
            );


        const area =
            pgPolygonArea(
                hull
            );


        const bounds =
            pgBounds(
                defenders
            );


        return {

            primary:
                area.toFixed(1) +
                " m²",

            secondary:
                (
                    bounds.maxX -
                    bounds.minX
                ).toFixed(1) +
                " m",

            relationship:
                (
                    bounds.maxY -
                    bounds.minY
                ).toFixed(1) +
                " m",

            primaryLabel:
                "Block Area",

            secondaryLabel:
                "Width",

            relationshipLabel:
                "Depth",

            geometry:
                hull,

            text:
                `The defensive block occupies approximately ${area.toFixed(1)} m² with a width of ${(bounds.maxX - bounds.minX).toFixed(1)} m and depth of ${(bounds.maxY - bounds.minY).toFixed(1)} m.`

        };

    }


    /* =====================================================
       DEFENSIVE GAPS
    ===================================================== */

    function pgAnalyzeGaps() {

        const defenders =
            pgHomePlayers();


        if (
            defenders.length <
            2
        ) {

            return pgInsufficient(
                "Add at least 2 HOME defenders."
            );

        }


        let maxDistance =
            0;


        let first =
            null;


        let second =
            null;


        for (
            let i = 0;
            i < defenders.length;
            i++
        ) {

            for (
                let j = i + 1;
                j < defenders.length;
                j++
            ) {

                const distance =
                    pgDistance(
                        defenders[i],
                        defenders[j]
                    );


                if (
                    distance >
                    maxDistance
                ) {

                    maxDistance =
                        distance;

                    first =
                        defenders[i];

                    second =
                        defenders[j];

                }

            }

        }


        return {

            primary:
                maxDistance.toFixed(1) +
                " m",

            secondary:
                first.name +
                " ↔ " +
                second.name,

            relationship:
                "Critical Gap",

            primaryLabel:
                "Largest Gap",

            secondaryLabel:
                "Players",

            relationshipLabel:
                "Spatial Meaning",

            geometry: [

                {
                    x:
                        first.x,

                    y:
                        first.y

                },

                {
                    x:
                        second.x,

                    y:
                        second.y

                }

            ],

            text:
                `The largest measured defensive separation is ${maxDistance.toFixed(1)} m between ${first.name} and ${second.name}.`

        };

    }


    /* =====================================================
       DEFENSIVE COVERAGE
    ===================================================== */

    function pgAnalyzeCoverage() {

        const defenders =
            pgHomePlayers();


        if (
            defenders.length <
            2
        ) {

            return pgInsufficient(
                "Add at least 2 HOME defenders."
            );

        }


        const radius =
            8;


        const pitchArea =
            105 *
            68;


        /*
           Approximation for the visual prototype.
           This will later become:
           ST_Buffer + ST_Union + ST_Difference
           in PostGIS.
        */

        const covered =
            Math.min(

                pitchArea,

                defenders.length *
                Math.PI *
                radius *
                radius *
                0.68

            );


        const exposed =
            pitchArea -
            covered;


        return {

            primary:
                covered.toFixed(0) +
                " m²",

            secondary:
                exposed.toFixed(0) +
                " m²",

            relationship:
                (
                    covered /
                    pitchArea *
                    100
                ).toFixed(1) +
                "%",

            primaryLabel:
                "Covered Space",

            secondaryLabel:
                "Exposed Space",

            relationshipLabel:
                "Coverage Ratio",

            geometry:
                defenders.map(
                    function (p) {

                        return {

                            x:
                                p.x,

                            y:
                                p.y

                        };

                    }
                ),

            text:
                `The defensive structure covers an estimated ${covered.toFixed(0)} m², leaving approximately ${exposed.toFixed(0)} m² exposed.`

        };

    }


    /* =====================================================
       NEAREST DEFENDER / PRESSURE
    ===================================================== */

    function pgAnalyzePressure() {

        const defenders =
            pgHomePlayers();


        if (
            defenders.length ===
            0
        ) {

            return pgInsufficient(
                "Add HOME defenders first."
            );

        }


        let target =
            window.pgBall;


        if (
            !target
        ) {

            const attackers =
                pgAwayPlayers();


            if (
                attackers.length >
                0
            ) {

                target =
                    attackers[0];

            }

        }


        if (
            !target
        ) {

            return pgInsufficient(
                "Place the ball or add an AWAY attacker."
            );

        }


        let nearest =
            null;


        let shortest =
            Infinity;


        defenders.forEach(
            function (defender) {

                const distance =
                    pgDistance(
                        defender,
                        target
                    );


                if (
                    distance <
                    shortest
                ) {

                    shortest =
                        distance;

                    nearest =
                        defender;

                }

            }
        );


        return {

            primary:
                shortest.toFixed(1) +
                " m",

            secondary:
                nearest.name,

            relationship:
                pgPressureLevel(
                    shortest
                ),

            primaryLabel:
                "Pressure Distance",

            secondaryLabel:
                "Nearest Defender",

            relationshipLabel:
                "Pressure Level",

            geometry: [

                {

                    x:
                        nearest.x,

                    y:
                        nearest.y

                },

                {

                    x:
                        target.x,

                    y:
                        target.y

                }

            ],

            text:
                `${nearest.name} is the nearest defender at ${shortest.toFixed(1)} m from the selected reference point.`

        };

    }


    /* =====================================================
       SPACE BETWEEN LINES
    ===================================================== */

    function pgAnalyzeSpaceBetweenLines() {

        const players =
            window.pgPlayers;


        if (
            players.length <
            4
        ) {

            return pgInsufficient(
                "Add more players from the two teams."
            );

        }


        const home =
            pgHomePlayers();


        const away =
            pgAwayPlayers();


        if (
            !home.length ||
            !away.length
        ) {

            return pgInsufficient(
                "Add players from both teams."
            );

        }


        const homeCenter =
            pgAveragePoint(
                home
            );


        const awayCenter =
            pgAveragePoint(
                away
            );


        const distance =
            pgDistance(
                homeCenter,
                awayCenter
            );


        return {

            primary:
                distance.toFixed(1) +
                " m",

            secondary:
                "Central Corridor",

            relationship:
                distance >
                15
                    ? "Large Space"
                    : "Compact",

            primaryLabel:
                "Line Separation",

            secondaryLabel:
                "Reception Zone",

            relationshipLabel:
                "Interpretation",

            geometry: [

                homeCenter,

                awayCenter

            ],

            text:
                `The estimated separation between the two team structures is ${distance.toFixed(1)} m.`

        };

    }


    /* =====================================================
       ATTACKING SPACE
    ===================================================== */

    function pgAnalyzeAttackingSpace() {

        const attackers =
            pgAwayPlayers();


        const defenders =
            pgHomePlayers();


        if (
            !attackers.length ||
            !defenders.length
        ) {

            return pgInsufficient(
                "Add AWAY attackers and HOME defenders."
            );

        }


        const separation =
            pgAverageNearestDistance(
                attackers,
                defenders
            );


        return {

            primary:
                separation.toFixed(1) +
                " m",

            secondary:
                attackers.length,

            relationship:
                separation >
                12
                    ? "Open Space"
                    : "Tight Space",

            primaryLabel:
                "Average Access Space",

            secondaryLabel:
                "Attackers",

            relationshipLabel:
                "Spatial Condition",

            text:
                `Attacking players are separated from their nearest defenders by an average of ${separation.toFixed(1)} m.`

        };

    }


    /* =====================================================
       PASSING LANES
    ===================================================== */

    function pgAnalyzePassingLanes() {

        const attackers =
            pgAwayPlayers();


        const defenders =
            pgHomePlayers();


        if (
            attackers.length <
            2 ||
            defenders.length <
            1
        ) {

            return pgInsufficient(
                "Add at least 2 AWAY attackers and 1 HOME defender."
            );

        }


        let open =
            0;


        let blocked =
            0;


        let example =
            null;


        for (
            let i = 0;
            i < attackers.length;
            i++
        ) {

            for (
                let j = i + 1;
                j < attackers.length;
                j++
            ) {

                let isBlocked =
                    false;


                defenders.forEach(
                    function (defender) {

                        const d =
                            pgPointToSegmentDistance(

                                defender,

                                attackers[i],

                                attackers[j]

                            );


                        if (
                            d <
                            3
                        ) {

                            isBlocked =
                                true;

                        }

                    }
                );


                if (
                    isBlocked
                ) {

                    blocked++;

                } else {

                    open++;


                    if (
                        !example
                    ) {

                        example = [

                            attackers[i],

                            attackers[j]

                        ];

                    }

                }

            }

        }


        return {

            primary:
                open,

            secondary:
                blocked,

            relationship:
                open >= blocked
                    ? "Open Passing Network"
                    : "Compressed Network",

            primaryLabel:
                "Open Lanes",

            secondaryLabel:
                "Blocked Lanes",

            relationshipLabel:
                "Passing Environment",

            geometry:
                example
                    ? [

                        {

                            x:
                                example[0].x,

                            y:
                                example[0].y

                        },

                        {

                            x:
                                example[1].x,

                            y:
                                example[1].y

                        }

                    ]
                    : null,

            text:
                `The current snapshot contains ${open} potentially open passing lanes and ${blocked} blocked lanes.`

        };

    }


    /* =====================================================
       LINE BREAK
    ===================================================== */

    function pgAnalyzeLineBreak() {

        const attackers =
            pgAwayPlayers();


        const defenders =
            pgHomePlayers();


        if (
            !attackers.length ||
            defenders.length <
            2
        ) {

            return pgInsufficient(
                "Add attacking players and at least 2 defenders."
            );

        }


        let best =
            attackers[0];


        let bestDistance =
            Infinity;


        attackers.forEach(
            function (attacker) {

                const distance =
                    pgAverageDistanceToGroup(
                        attacker,
                        defenders
                    );


                if (
                    distance <
                    bestDistance
                ) {

                    bestDistance =
                        distance;

                    best =
                        attacker;

                }

            }
        );


        return {

            primary:
                bestDistance.toFixed(1) +
                " m",

            secondary:
                best.name,

            relationship:
                bestDistance <
                10
                    ? "Inside Defensive Structure"
                    : "Outside Structure",

            primaryLabel:
                "Line Interaction",

            secondaryLabel:
                "Attacker",

            relationshipLabel:
                "Break Status",

            text:
                `${best.name} is the closest attacking candidate to the defensive structure at an average distance of ${bestDistance.toFixed(1)} m.`

        };

    }


    /* =====================================================
       DRAW RESULT
    ===================================================== */

    function pgDrawResult(
        analysisId,
        result
    ) {

        if (
            !window.map
        ) {

            return;

        }


        pgCreateLayers();


        pgResultLayer.clearLayers();


        if (
            !result
        ) {

            return;

        }


        /*
           DEFENSIVE STRUCTURE
        */

        if (
            analysisId ===
            "defensive_structure"
        ) {

            if (
                result.geometry &&
                result.geometry.length >=
                3
            ) {

                L.polygon(

                    result.geometry.map(
                        function (p) {

                            return [
                                p.y,
                                p.x
                            ];

                        }
                    ),

                    {

                        color:
                            "#22d3ee",

                        weight:
                            3,

                        fillColor:
                            "#22d3ee",

                        fillOpacity:
                            0.10,

                        dashArray:
                            "8 6"

                    }

                ).addTo(
                    pgResultLayer
                );

            }


            return;

        }


        /*
           DEFENSIVE GAP
        */

        if (
            analysisId ===
            "defensive_gaps"
        ) {

            if (
                result.geometry
            ) {

                L.polyline(

                    result.geometry.map(
                        function (p) {

                            return [
                                p.y,
                                p.x
                            ];

                        }
                    ),

                    {

                        color:
                            "#fb7185",

                        weight:
                            5,

                        dashArray:
                            "8 6"

                    }

                ).addTo(
                    pgResultLayer
                );


                const middle =
                    {

                        x:
                            (
                                result.geometry[0].x +
                                result.geometry[1].x
                            ) / 2,

                        y:
                            (
                                result.geometry[0].y +
                                result.geometry[1].y
                            ) / 2

                    };


                pgAddMapLabel(

                    middle.x,

                    middle.y,

                    result.primary

                );

            }


            return;

        }


        /*
           COVERAGE
        */

        if (
            analysisId ===
            "defensive_coverage"
        ) {

            if (
                result.geometry
            ) {

                result.geometry.forEach(
                    function (p) {

                        L.circle(

                            [
                                p.y,
                                p.x
                            ],

                            {

                                radius:
                                    8,

                                color:
                                    "#34d399",

                                weight:
                                    1.5,

                                fillColor:
                                    "#34d399",

                                fillOpacity:
                                    0.10

                            }

                        ).addTo(
                            pgResultLayer
                        );

                    }
                );

            }


            return;

        }


        /*
           PRESSURE
        */

        if (
            analysisId ===
            "nearest_pressure"
        ) {

            if (
                result.geometry
            ) {

                L.polyline(

                    result.geometry.map(
                        function (p) {

                            return [
                                p.y,
                                p.x
                            ];

                        }
                    ),

                    {

                        color:
                            "#fbbf24",

                        weight:
                            4,

                        dashArray:
                            "6 5"

                    }

                ).addTo(
                    pgResultLayer
                );

            }


            return;

        }


        /*
           GENERIC LINE
        */

        if (
            result.geometry &&
            result.geometry.length ===
            2
        ) {

            L.polyline(

                result.geometry.map(
                    function (p) {

                        return [
                            p.y,
                            p.x
                        ];

                    }
                ),

                {

                    color:
                        "#a78bfa",

                    weight:
                        4,

                    dashArray:
                        "8 6"

                }

            ).addTo(
                pgResultLayer
            );

        }

    }


    /* =====================================================
       MAP LABEL
    ===================================================== */

    function pgAddMapLabel(
        x,
        y,
        text
    ) {

        L.marker(

            [
                y,
                x
            ],

            {

                icon:
                    L.divIcon({

                        className:
                            "pg-analysis-label",

                        html:
                            `<span>${pgEscape(
                                text
                            )}</span>`,

                        iconSize:
                            null,

                        iconAnchor:
                            [0, 0]

                    }),

                interactive:
                    false

            }

        ).addTo(
            pgResultLayer
        );

    }


    /* =====================================================
       SHOW INSIGHT
    ===================================================== */

    function pgShowInsight(
        analysis,
        result
    ) {

        const title =
            document.getElementById(
                "pgInsightTitle"
            );


        const text =
            document.getElementById(
                "pgInsightText"
            );


        const metrics =
            document.getElementById(
                "pgInsightMetrics"
            );


        if (
            title
        ) {

            title.textContent =
                analysis.title;

        }


        if (
            text
        ) {

            text.textContent =
                result.text ||
                result.error ||
                analysis.description;

        }


        if (
            metrics
        ) {

            metrics.innerHTML = `

                <div class="insight-metric">

                    <span>
                        ${pgEscape(
                            result.primaryLabel ||
                            "Primary"
                        )}
                    </span>

                    <strong>
                        ${pgEscape(
                            String(
                                result.primary ||
                                "—"
                            )
                        )}
                    </strong>

                </div>


                <div class="insight-metric">

                    <span>
                        ${pgEscape(
                            result.secondaryLabel ||
                            "Secondary"
                        )}
                    </span>

                    <strong>
                        ${pgEscape(
                            String(
                                result.secondary ||
                                "—"
                            )
                        )}
                    </strong>

                </div>


                <div class="insight-metric">

                    <span>
                        ${pgEscape(
                            result.relationshipLabel ||
                            "Relationship"
                        )}
                    </span>

                    <strong>
                        ${pgEscape(
                            String(
                                result.relationship ||
                                "—"
                            )
                        )}
                    </strong>

                </div>

            `;

        }

    }


    /* =====================================================
       REPORT MODE
    ===================================================== */

    window.pgSetReportMode =
        function (
            mode
        ) {

            if (
                !window.pgAnalysisResult
            ) {

                pgShowPlacementMessage(
                    "Run an analysis first."
                );

                return;

            }


            const analysis =
                window.pgAnalyses[
                    window.pgCurrentAnalysis
                ];


            const result =
                window.pgAnalysisResult;


            const report =
                document.getElementById(
                    "pgReportText"
                );


            if (
                !report
            ) {

                return;

            }


            let heading =
                "FAN REPORT";


            if (
                mode ===
                "coach"
            ) {

                heading =
                    "COACH REPORT";

            }


            if (
                mode ===
                "analyst"
            ) {

                heading =
                    "PERFORMANCE ANALYST REPORT";

            }


            report.innerHTML = `

                <strong>
                    ${heading}
                </strong>

                <p>
                    ${pgEscape(
                        analysis.title
                    )}
                </p>

                <p>
                    ${pgEscape(
                        result.text ||
                        analysis.description
                    )}
                </p>

                <small>
                    Spatial method:
                    ${pgEscape(
                        analysis.requirements
                    )}
                </small>

            `;

        };


    /* =====================================================
       ASSISTANT
    ===================================================== */

    window.pgAskAssistant =
        function () {

            const input =
                document.getElementById(
                    "pgAssistantInput"
                );


            if (
                !input
            ) {

                return;

            }


            const question =
                input.value
                    .trim()
                    .toLowerCase();


            if (
                !question
            ) {

                return;

            }


            input.value =
                "";


            let analysisId =
                null;


            if (
                question.includes(
                    "gap"
                ) ||
                question.includes(
                    "spacing"
                )
            ) {

                analysisId =
                    "defensive_gaps";

            }


            else if (
                question.includes(
                    "pressure"
                ) ||
                question.includes(
                    "nearest"
                )
            ) {

                analysisId =
                    "nearest_pressure";

            }


            else if (
                question.includes(
                    "coverage"
                ) ||
                question.includes(
                    "cover"
                )
            ) {

                analysisId =
                    "defensive_coverage";

            }


            else if (
                question.includes(
                    "structure"
                ) ||
                question.includes(
                    "shape"
                ) ||
                question.includes(
                    "compact"
                )
            ) {

                analysisId =
                    "defensive_structure";

            }


            else if (
                question.includes(
                    "passing"
                ) ||
                question.includes(
                    "lane"
                )
            ) {

                analysisId =
                    "passing_lanes";

            }


            else if (
                question.includes(
                    "line break"
                )
            ) {

                analysisId =
                    "line_break";

            }


            if (
                analysisId
            ) {

                window.pgSelectAnalysis(
                    analysisId
                );


                pgShowPlacementMessage(

                    `I selected ${window.pgAnalyses[analysisId].title}. Press RUN ANALYSIS.`

                );

            } else {

                pgShowPlacementMessage(

                    "Try: defensive gaps, pressure, coverage, structure or passing lanes."

                );

            }

        };


    /* =====================================================
       RESET
    ===================================================== */

    window.pgResetScenario =
        function () {

            window.pgPlayers =
                [];

            window.pgBall =
                null;

            window.pgAnalysisResult =
                null;

            window.pgPlayerNumber =
                1;


            if (
                pgPlayerLayer
            ) {

                pgPlayerLayer.clearLayers();

            }


            if (
                pgBallLayer
            ) {

                pgBallLayer.clearLayers();

            }


            if (
                pgResultLayer
            ) {

                pgResultLayer.clearLayers();

            }


            const report =
                document.getElementById(
                    "pgReportText"
                );


            if (
                report
            ) {

                report.innerHTML =
                    "";

            }


            const insight =
                document.getElementById(
                    "pgInsightTitle"
                );


            if (
                insight
            ) {

                insight.textContent =
                    "No analysis executed";

            }


            const insightText =
                document.getElementById(
                    "pgInsightText"
                );


            if (
                insightText
            ) {

                insightText.textContent =
                    "Add players and the ball, then run a defensive analysis.";

            }


            const metrics =
                document.getElementById(
                    "pgInsightMetrics"
                );


            if (
                metrics
            ) {

                metrics.innerHTML =
                    "";

            }


            pgUpdateScenarioUI();


            pgShowPlacementMessage(
                "Scenario reset"
            );

        };


    /* =====================================================
       IMPORT SCENARIO
    ===================================================== */

    window.pgImportScenario =
        function () {

            const input =
                document.createElement(
                    "input"
                );


            input.type =
                "file";


            input.accept =
                ".json,.csv";


            input.style.display =
                "none";


            document.body.appendChild(
                input
            );


            input.addEventListener(
                "change",
                function () {

                    const file =
                        input.files[0];


                    if (
                        !file
                    ) {

                        input.remove();

                        return;

                    }


                    const reader =
                        new FileReader();


                    reader.onload =
                        function () {

                            try {

                                if (
                                    file.name
                                        .toLowerCase()
                                        .endsWith(
                                            ".json"
                                        )
                                ) {

                                    pgImportJSON(
                                        reader.result
                                    );

                                } else {

                                    pgImportCSV(
                                        reader.result
                                    );

                                }

                            } catch (
                                error
                            ) {

                                console.error(
                                    error
                                );


                                pgShowPlacementMessage(
                                    "Could not import scenario."
                                );

                            }


                            input.remove();

                        };


                    reader.readAsText(
                        file
                    );

                }
            );


            input.click();

        };


    /* =====================================================
       IMPORT JSON
    ===================================================== */

    function pgImportJSON(
        text
    ) {

        const data =
            JSON.parse(
                text
            );


        const players =
            Array.isArray(data)
                ? data
                : data.players;


        if (
            !Array.isArray(
                players
            )
        ) {

            throw new Error(
                "Invalid JSON player data."
            );

        }


        window.pgPlayers =
            players
                .map(
                    function (
                        player,
                        index
                    ) {

                        return {

                            id:
                                player.id ||
                                `import_${index}`,

                            name:
                                player.name ||
                                `Player ${index + 1}`,

                            team:
                                String(
                                    player.team ||
                                    "HOME"
                                ).toUpperCase() ===
                                "AWAY"
                                    ? "AWAY"
                                    : "HOME",

                            position:
                                player.position ||
                                "CM",

                            x:
                                Number(
                                    player.x
                                ),

                            y:
                                Number(
                                    player.y
                                )

                        };

                    }
                )
                .filter(
                    function (player) {

                        return (

                            Number.isFinite(
                                player.x
                            ) &&

                            Number.isFinite(
                                player.y
                            )

                        );

                    }
                );


        if (
            data.ball
        ) {

            window.pgBall = {

                x:
                    Number(
                        data.ball.x
                    ),

                y:
                    Number(
                        data.ball.y
                    )

            };

        }


        pgRenderPlayers();

        pgRenderBall();

        pgUpdateScenarioUI();


        pgShowPlacementMessage(
            `${window.pgPlayers.length} players imported`
        );

    }


    /* =====================================================
       IMPORT CSV
    ===================================================== */

    function pgImportCSV(
        text
    ) {

        const lines =
            text
                .split(/\r?\n/)
                .filter(
                    function (line) {

                        return line.trim();

                    }
                );


        if (
            lines.length <
            2
        ) {

            throw new Error(
                "CSV is empty."
            );

        }


        const headers =
            lines[0]
                .split(",")
                .map(
                    function (header) {

                        return header
                            .trim()
                            .toLowerCase();

                    }
                );


        const players =
            [];


        for (
            let i = 1;
            i < lines.length;
            i++
        ) {

            const values =
                lines[i]
                    .split(",")
                    .map(
                        function (value) {

                            return value.trim();

                        }
                    );


            const row = {};


            headers.forEach(
                function (
                    header,
                    index
                ) {

                    row[header] =
                        values[index];

                }
            );


            const player = {

                id:
                    row.id ||
                    `csv_${i}`,

                name:
                    row.name ||
                    `Player ${i}`,

                team:
                    String(
                        row.team ||
                        "HOME"
                    ).toUpperCase() ===
                    "AWAY"
                        ? "AWAY"
                        : "HOME",

                position:
                    row.position ||
                    "CM",

                x:
                    Number(
                        row.x
                    ),

                y:
                    Number(
                        row.y
                    )

            };


            if (
                Number.isFinite(
                    player.x
                ) &&
                Number.isFinite(
                    player.y
                )
            ) {

                players.push(
                    player
                );

            }

        }


        window.pgPlayers =
            players;


        pgRenderPlayers();

        pgUpdateScenarioUI();


        pgShowPlacementMessage(
            `${players.length} players imported`
        );

    }


    /* =====================================================
       SCENARIO UI
    ===================================================== */

    function pgUpdateScenarioUI() {

        const count =
            document.getElementById(
                "pgPlayerCount"
            );


        const ballStatus =
            document.getElementById(
                "pgBallStatus"
            );


        if (
            count
        ) {

            const home =
                pgHomePlayers()
                    .length;


            const away =
                pgAwayPlayers()
                    .length;


            count.textContent =
                `${home} H · ${away} A`;

        }


        if (
            ballStatus
        ) {

            ballStatus.textContent =
                window.pgBall
                    ? "SET"
                    : "NOT SET";

        }

    }


    /* =====================================================
       ANALYSIS GROUP TOGGLE
    ===================================================== */

    window.pgToggleAnalysisGroup =
        function (
            button
        ) {

            if (
                !button
            ) {

                return;

            }


            button.classList.toggle(
                "active"
            );


            const content =
                button.nextElementSibling;


            if (
                content
            ) {

                content.classList.toggle(
                    "open"
                );

            }

        };


    /* =====================================================
       PLACEMENT MESSAGE
    ===================================================== */

    function pgShowPlacementMessage(
        message
    ) {

        let element =
            document.getElementById(
                "pgPlacementMessage"
            );


        if (
            !element
        ) {

            element =
                document.createElement(
                    "div"
                );


            element.id =
                "pgPlacementMessage";


            element.style.position =
                "fixed";


            element.style.left =
                "50%";


            element.style.bottom =
                "30px";


            element.style.transform =
                "translateX(-50%)";


            element.style.zIndex =
                "99999";


            element.style.padding =
                "12px 20px";


            element.style.borderRadius =
                "12px";


            element.style.background =
                "rgba(5,15,30,.95)";


            element.style.border =
                "1px solid rgba(34,211,238,.4)";


            element.style.color =
                "#e2e8f0";


            element.style.fontSize =
                "13px";


            element.style.fontWeight =
                "600";


            element.style.boxShadow =
                "0 15px 40px rgba(0,0,0,.4)";


            document.body.appendChild(
                element
            );

        }


        element.textContent =
            message;


        element.style.opacity =
            "1";


        clearTimeout(
            element._timer
        );


        element._timer =
            setTimeout(
                function () {

                    element.style.opacity =
                        "0";

                },
                2500
            );

    }


    /* =====================================================
       DATA HELPERS
    ===================================================== */

    function pgHomePlayers() {

        return window.pgPlayers.filter(
            function (player) {

                return (
                    player.team ===
                    "HOME"
                );

            }
        );

    }


    function pgAwayPlayers() {

        return window.pgPlayers.filter(
            function (player) {

                return (
                    player.team ===
                    "AWAY"
                );

            }
        );

    }


    function pgDistance(
        a,
        b
    ) {

        const dx =
            a.x - b.x;


        const dy =
            a.y - b.y;


        return Math.sqrt(
            dx * dx +
            dy * dy
        );

    }


    function pgAveragePoint(
        players
    ) {

        const x =
            players.reduce(
                function (
                    sum,
                    player
                ) {

                    return (
                        sum +
                        player.x
                    );

                },
                0
            ) /
            players.length;


        const y =
            players.reduce(
                function (
                    sum,
                    player
                ) {

                    return (
                        sum +
                        player.y
                    );

                },
                0
            ) /
            players.length;


        return {

            x:
                x,

            y:
                y

        };

    }


    function pgAverageNearestDistance(
        source,
        target
    ) {

        if (
            !source.length ||
            !target.length
        ) {

            return 0;

        }


        let total =
            0;


        source.forEach(
            function (player) {

                let shortest =
                    Infinity;


                target.forEach(
                    function (other) {

                        const d =
                            pgDistance(
                                player,
                                other
                            );


                        if (
                            d <
                            shortest
                        ) {

                            shortest =
                                d;

                        }

                    }
                );


                total +=
                    shortest;

            }
        );


        return (
            total /
            source.length
        );

    }


    function pgAverageDistanceToGroup(
        player,
        group
    ) {

        if (
            !group.length
        ) {

            return 0;

        }


        return (

            group.reduce(
                function (
                    sum,
                    other
                ) {

                    return (
                        sum +
                        pgDistance(
                            player,
                            other
                        )
                    );

                },
                0
            ) /
            group.length

        );

    }


    /* =====================================================
       BOUNDS
    ===================================================== */

    function pgBounds(
        players
    ) {

        const xs =
            players.map(
                function (p) {

                    return p.x;

                }
            );


        const ys =
            players.map(
                function (p) {

                    return p.y;

                }
            );


        return {

            minX:
                Math.min(
                    ...xs
                ),

            maxX:
                Math.max(
                    ...xs
                ),

            minY:
                Math.min(
                    ...ys
                ),

            maxY:
                Math.max(
                    ...ys
                )

        };

    }


    /* =====================================================
       CONVEX HULL
    ===================================================== */

    function pgConvexHull(
        points
    ) {

        if (
            points.length <=
            2
        ) {

            return points;

        }


        const sorted =
            [...points].sort(
                function (
                    a,
                    b
                ) {

                    if (
                        a.x ===
                        b.x
                    ) {

                        return (
                            a.y -
                            b.y
                        );

                    }


                    return (
                        a.x -
                        b.x
                    );

                }
            );


        function cross(
            o,
            a,
            b
        ) {

            return (

                (
                    a.x -
                    o.x
                ) *

                (
                    b.y -
                    o.y
                )

                -

                (
                    a.y -
                    o.y
                ) *

                (
                    b.x -
                    o.x
                )

            );

        }


        const lower =
            [];


        sorted.forEach(
            function (point) {

                while (

                    lower.length >=
                    2 &&

                    cross(

                        lower[
                            lower.length -
                            2
                        ],

                        lower[
                            lower.length -
                            1
                        ],

                        point

                    ) <= 0

                ) {

                    lower.pop();

                }


                lower.push(
                    point
                );

            }
        );


        const upper =
            [];


        for (
            let i =
                sorted.length -
                1;

            i >= 0;

            i--
        ) {

            const point =
                sorted[i];


            while (

                upper.length >=
                2 &&

                cross(

                    upper[
                        upper.length -
                        2
                    ],

                    upper[
                        upper.length -
                        1
                    ],

                    point

                ) <= 0

            ) {

                upper.pop();

            }


            upper.push(
                point
            );

        }


        upper.pop();

        lower.pop();


        return lower.concat(
            upper
        );

    }


    /* =====================================================
       POLYGON AREA
    ===================================================== */

    function pgPolygonArea(
        points
    ) {

        if (
            points.length <
            3
        ) {

            return 0;

        }


        let area =
            0;


        for (
            let i = 0;
            i < points.length;
            i++
        ) {

            const j =
                (
                    i + 1
                ) %
                points.length;


            area +=
                points[i].x *
                points[j].y;


            area -=
                points[j].x *
                points[i].y;

        }


        return Math.abs(
            area / 2
        );

    }


    /* =====================================================
       POINT TO SEGMENT
    ===================================================== */

    function pgPointToSegmentDistance(
        point,
        start,
        end
    ) {

        const dx =
            end.x -
            start.x;


        const dy =
            end.y -
            start.y;


        if (
            dx === 0 &&
            dy === 0
        ) {

            return pgDistance(
                point,
                start
            );

        }


        let t =

            (

                (
                    point.x -
                    start.x
                ) *
                dx

                +

                (
                    point.y -
                    start.y
                ) *
                dy

            )

            /

            (
                dx * dx +
                dy * dy
            );


        t =
            Math.max(
                0,
                Math.min(
                    1,
                    t
                )
            );


        const projection = {

            x:
                start.x +
                t * dx,

            y:
                start.y +
                t * dy

        };


        return pgDistance(
            point,
            projection
        );

    }


    /* =====================================================
       PRESSURE LEVEL
    ===================================================== */

    function pgPressureLevel(
        distance
    ) {

        if (
            distance <=
            3
        ) {

            return "VERY HIGH";

        }


        if (
            distance <=
            6
        ) {

            return "HIGH";

        }


        if (
            distance <=
            10
        ) {

            return "MEDIUM";

        }


        return "LOW";

    }


    /* =====================================================
       INSUFFICIENT DATA
    ===================================================== */

    function pgInsufficient(
        message
    ) {

        pgShowPlacementMessage(
            message
        );


        return {

            error:
                true,

            primary:
                "—",

            secondary:
                "—",

            relationship:
                "Insufficient Data",

            primaryLabel:
                "Status",

            secondaryLabel:
                "Required",

            relationshipLabel:
                "Analysis"

        };

    }


    /* =====================================================
       DEMO
    ===================================================== */

    function pgDemoResult() {

        return {

            primary:
                "—",

            secondary:
                "—",

            relationship:
                "Demo",

            primaryLabel:
                "Metric",

            secondaryLabel:
                "Secondary",

            relationshipLabel:
                "Status"

        };

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function pgEscape(
        value
    ) {

        return String(
            value
        )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

    }


    /* =====================================================
       START
    ===================================================== */

    pgInitializeBridge();


})();

/* =========================================================
   PITCHGRID — SPATIAL EVIDENCE FIX
   Connects the evidence panel directly to the real
   PitchGrid analysis state.
========================================================= */

(function () {

    "use strict";

    function el(id) {
        return document.getElementById(id);
    }


    /* ---------------------------------------------------------
       UPDATE SPATIAL EVIDENCE
    --------------------------------------------------------- */

    function updateSpatialEvidence() {

        const result =
            window.pgAnalysisResult;

        const analysisId =
            window.pgCurrentAnalysis;

        const analysis =
            window.pgAnalyses
                ? window.pgAnalyses[analysisId]
                : null;


        if (!analysis) {
            return;
        }


        /* -----------------------------------------------------
           ANALYSIS ERROR / INSUFFICIENT DATA
        ----------------------------------------------------- */

        if (
            result &&
            result.error
        ) {

            if (el("evidenceTitle")) {
                el("evidenceTitle").textContent =
                    analysis.title;
            }

            if (el("evidenceHeadline")) {
                el("evidenceHeadline").textContent =
                    "MORE SPATIAL DATA REQUIRED";
            }

            if (el("evidenceDescription")) {
                el("evidenceDescription").textContent =
                    result.error;
            }

            if (el("evidenceSignal")) {
                el("evidenceSignal").textContent =
                    "WAITING";
            }

            if (el("metricStructure")) {
                el("metricStructure").textContent =
                    "INCOMPLETE";
            }

            return;
        }


        /* -----------------------------------------------------
           NO RESULT
        ----------------------------------------------------- */

        if (!result) {
            return;
        }


        /* -----------------------------------------------------
           MAIN EVIDENCE HEADER
        ----------------------------------------------------- */

        if (el("evidenceTitle")) {

            el("evidenceTitle").textContent =
                analysis.title ||
                "Spatial Analysis";

        }


        if (el("evidenceHeadline")) {

            el("evidenceHeadline").textContent =
                "SPATIAL ANALYSIS COMPLETE";

        }


        if (el("evidenceDescription")) {

            el("evidenceDescription").textContent =
                result.text ||
                analysis.description ||
                "PitchGrid reconstructed the current spatial situation.";

        }


        if (el("evidenceSignal")) {

            el("evidenceSignal").textContent =
                "INTERPRETED";

        }


        if (
            el("evidenceClock") &&
            el("sceneClock")
        ) {

            el("evidenceClock").textContent =
                el("sceneClock").textContent;

        }


        /* -----------------------------------------------------
           METRICS
        ----------------------------------------------------- */

        if (el("metricExposure")) {

            el("metricExposure").textContent =
                result.primary ||
                "—";

        }


        if (el("metricArea")) {

            el("metricArea").textContent =
                result.secondary ||
                "—";

        }


        if (el("metricNearest")) {

            el("metricNearest").textContent =
                result.relationship ||
                "—";

        }


        if (el("metricStructure")) {

            el("metricStructure").textContent =
                "ANALYZED";

        }


        /* -----------------------------------------------------
           TACTICAL STORY
        ----------------------------------------------------- */

        if (el("storyWhat")) {

            el("storyWhat").textContent =
                result.text ||
                "The spatial relationship has been reconstructed from the current snapshot.";

        }


        if (el("storyWhy")) {

            el("storyWhy").textContent =
                buildWhyStatement(
                    analysis,
                    result
                );

        }


        if (el("storyTactical")) {

            el("storyTactical").textContent =
                buildTacticalStatement(
                    analysis,
                    result
                );

        }


        /* -----------------------------------------------------
           SCROLL / ACTIVE STATE
        ----------------------------------------------------- */

        const evidence =
            el("spatialEvidence");

        if (evidence) {

            evidence.classList.add(
                "interpreted"
            );

        }

    }


    /* ---------------------------------------------------------
       WHY DID IT MATTER?
    --------------------------------------------------------- */

    function buildWhyStatement(
        analysis,
        result
    ) {

        const id =
            window.pgCurrentAnalysis;


        if (
            id === "defensive_gaps"
        ) {

            return (
                "The measured separation shows where the defensive structure lost spatial connection between players."
            );

        }


        if (
            id === "defensive_coverage"
        ) {

            return (
                "The coverage measurement shows how much of the defensive space is protected versus exposed."
            );

        }


        if (
            id === "nearest_pressure"
        ) {

            return (
                "The defender-to-target distance indicates how much time and spatial access the attacker has in this moment."
            );

        }


        if (
            id === "defensive_structure"
        ) {

            return (
                "The defensive geometry shows how the block is organized through its spatial footprint."
            );

        }


        if (
            id === "space_between_lines"
        ) {

            return (
                "The distance between units reveals whether the central corridor is becoming available to the opponent."
            );

        }


        if (
            id === "attacking_space"
        ) {

            return (
                "The available space around the attacking players identifies where progression can become possible."
            );

        }


        if (
            id === "passing_lanes"
        ) {

            return (
                "The spatial relationships determine whether a passing route is open or blocked."
            );

        }


        if (
            id === "line_break"
        ) {

            return (
                "The geometry indicates whether an attacker can access or penetrate the defensive structure."
            );

        }


        return (
            "The geometry shows how player spacing shaped access, pressure and available space in the scene."
        );

    }


    /* ---------------------------------------------------------
       TACTICAL INTERPRETATION
    --------------------------------------------------------- */

    function buildTacticalStatement(
        analysis,
        result
    ) {

        const id =
            window.pgCurrentAnalysis;


        if (
            id === "defensive_gaps"
        ) {

            return (
                "The key tactical question is whether this gap can be attacked before the defensive structure reconnects."
            );

        }


        if (
            id === "nearest_pressure"
        ) {

            return (
                "The important detail is the relationship between the ball, the nearest defender and the available attacking space."
            );

        }


        if (
            id === "defensive_coverage"
        ) {

            return (
                "The tactical consequence depends on whether the exposed geometry can be reached or exploited by the attacking side."
            );

        }


        if (
            id === "passing_lanes"
        ) {

            return (
                "The passing lane becomes tactically relevant when an attacker can receive beyond or between the defensive lines."
            );

        }


        if (
            id === "line_break"
        ) {

            return (
                "A successful line break changes the spatial relationship between the attacker and the defensive structure."
            );

        }


        return (
            "The important point is not a single player position, but how the surrounding structure created or removed space."
        );

    }


    /* =========================================================
       AUDIENCE OUTPUT
    ========================================================= */

    window.pgBuildAudience =
        function (mode) {

            updateSpatialEvidence();


            const output =
                el("audienceOutput");


            if (!output) {
                return;
            }


            const result =
                window.pgAnalysisResult;


            const analysis =
                window.pgAnalyses
                    ? window.pgAnalyses[
                        window.pgCurrentAnalysis
                    ]
                    : null;


            if (
                !result ||
                !analysis
            ) {

                output.innerHTML = `
                    <strong>NO SPATIAL SCENE</strong>
                    <p>
                        Run a spatial analysis first.
                    </p>
                `;

                output.classList.add("show");

                return;
            }


            const title =
                analysis.title;


            let heading =
                "ANALYST REPORT";


            let story =
                "";


            if (
                mode === "coach"
            ) {

                heading =
                    "COACH REPORT";

                story =
                    "The spatial evidence highlights a tactical relationship that should be reviewed: where the structure opened, where pressure was applied, and where the next action became available.";

            }


            else if (
                mode === "fan"
            ) {

                heading =
                    "FAN STORY";

                story =
                    "The simple football story is that player positioning changed the space around the ball and created a new tactical possibility.";

            }


            else {

                heading =
                    "PERFORMANCE ANALYST REPORT";

                story =
                    "The snapshot can be read through measurable spatial relationships: distances, gaps, defensive structure and access to space.";

            }


            output.innerHTML = `

                <div class="audience-result">

                    <span class="audience-result-kicker">
                        ${heading}
                    </span>

                    <h3>
                        ${title}
                    </h3>

                    <p>
                        ${story}
                    </p>

                    <p>
                        ${result.text || analysis.description}
                    </p>

                    <div class="audience-metrics">

                        <span>
                            ${result.primaryLabel || "PRIMARY"}
                            <b>${result.primary || "—"}</b>
                        </span>

                        <span>
                            ${result.secondaryLabel || "SECONDARY"}
                            <b>${result.secondary || "—"}</b>
                        </span>

                        <span>
                            ${result.relationshipLabel || "RELATIONSHIP"}
                            <b>${result.relationship || "—"}</b>
                        </span>

                    </div>

                </div>

            `;


            output.classList.add(
                "show"
            );


            output.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });

        };


    /* =========================================================
       PITCHGRID ARTICLE
    ========================================================= */

    window.pgOpenArticle =
        function () {

            updateSpatialEvidence();


            const output =
                el("audienceOutput");


            if (!output) {
                return;
            }


            const result =
                window.pgAnalysisResult;


            const analysis =
                window.pgAnalyses
                    ? window.pgAnalyses[
                        window.pgCurrentAnalysis
                    ]
                    : null;


            if (
                !result ||
                !analysis
            ) {

                output.innerHTML = `
                    <strong>NO SCENE TO PUBLISH</strong>
                    <p>
                        Run a spatial analysis before turning the snapshot into an article.
                    </p>
                `;

                output.classList.add("show");

                return;
            }


            output.innerHTML = `

                <div class="audience-result">

                    <span class="audience-result-kicker">
                        PITCHGRID STORY
                    </span>

                    <h3>
                        ${analysis.title}
                    </h3>

                    <p>
                        The moment begins with the spatial setup.
                        PitchGrid then reveals the geometry,
                        identifies the important relationship,
                        and translates it into a tactical explanation.
                    </p>

                    <div class="article-flow">

                        <span>01 · THE MOMENT</span>
                        <span>02 · SPATIAL EVIDENCE</span>
                        <span>03 · WHAT CHANGED</span>
                        <span>04 · WHY IT MATTERED</span>
                        <span>05 · TACTICAL TAKEAWAY</span>

                    </div>

                    <p>
                        ${result.text || analysis.description}
                    </p>

                </div>

            `;


            output.classList.add(
                "show"
            );


            output.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });

        };


    /* =========================================================
       HOOK INTO RUN SPATIAL ANALYSIS
    ========================================================= */

    const oldRun =
        window.pgRunAnalysis;


    if (
        typeof oldRun === "function"
    ) {

        window.pgRunAnalysis =
            function () {

                const response =
                    oldRun.apply(
                        this,
                        arguments
                    );


                /*
                   Wait because the analysis engine
                   updates pgAnalysisResult after
                   the calculation.
                */

                setTimeout(
                    function () {

                        updateSpatialEvidence();

                    },
                    100
                );


                setTimeout(
                    function () {

                        updateSpatialEvidence();

                    },
                    500
                );


                setTimeout(
                    function () {

                        updateSpatialEvidence();

                    },
                    1000
                );


                return response;

            };

    }


    /* =========================================================
       REPORT MODE VISUAL STATE
    ========================================================= */

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".output-actions button"
                );


            if (!button) {
                return;
            }


            document
                .querySelectorAll(
                    ".output-actions button"
                )
                .forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


            button.classList.add(
                "active"
            );

        }
    );


})();

/* =========================================================
   PITCHGRID FINAL INTELLIGENCE PATCH
   SPACE + ATTACK + EVIDENCE + ARTICLE
========================================================= */

(function () {

    "use strict";

    /* =====================================================
       HELPERS
    ===================================================== */

    function pgx(id) {
        return document.getElementById(id);
    }

    function setText(id, value) {

        const el = pgx(id);

        if (el) {
            el.textContent = value ?? "—";
        }

    }

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

    function distance(a, b) {

        if (!a || !b) return Infinity;

        return Math.hypot(
            Number(a.x) - Number(b.x),
            Number(a.y) - Number(b.y)
        );

    }

    function getHomePlayers() {

        return (window.pgPlayers || [])
            .filter(p => p.team === "HOME");

    }

    function getAwayPlayers() {

        return (window.pgPlayers || [])
            .filter(p => p.team === "AWAY");

    }

    function getBall() {

        return window.pgBall || null;

    }

    function nearestPlayer(target, players) {

        if (!target || !players.length) {
            return null;
        }

        let best = null;

        players.forEach(player => {

            const d = distance(target, player);

            if (!best || d < best.distance) {

                best = {
                    player,
                    distance: d
                };

            }

        });

        return best;

    }

    function getBounds(players) {

        if (!players.length) {
            return null;
        }

        return {

            minX: Math.min(...players.map(p => Number(p.x))),
            maxX: Math.max(...players.map(p => Number(p.x))),

            minY: Math.min(...players.map(p => Number(p.y))),
            maxY: Math.max(...players.map(p => Number(p.y)))

        };

    }

    function convexHull(points) {

        if (points.length <= 2) {
            return points.slice();
        }

        const sorted = [...points]
            .sort((a, b) =>
                a.x === b.x
                    ? a.y - b.y
                    : a.x - b.x
            );

        function cross(o, a, b) {

            return (
                (a.x - o.x) *
                (b.y - o.y)
            ) - (
                (a.y - o.y) *
                (b.x - o.x)
            );

        }

        const lower = [];

        sorted.forEach(point => {

            while (
                lower.length >= 2 &&
                cross(
                    lower[lower.length - 2],
                    lower[lower.length - 1],
                    point
                ) <= 0
            ) {

                lower.pop();

            }

            lower.push(point);

        });

        const upper = [];

        for (
            let i = sorted.length - 1;
            i >= 0;
            i--
        ) {

            const point = sorted[i];

            while (
                upper.length >= 2 &&
                cross(
                    upper[upper.length - 2],
                    upper[upper.length - 1],
                    point
                ) <= 0
            ) {

                upper.pop();

            }

            upper.push(point);

        }

        lower.pop();
        upper.pop();

        return lower.concat(upper);

    }

    function polygonArea(points) {

        if (points.length < 3) {
            return 0;
        }

        let area = 0;

        for (
            let i = 0;
            i < points.length;
            i++
        ) {

            const j =
                (i + 1) %
                points.length;

            area +=
                points[i].x *
                points[j].y;

            area -=
                points[j].x *
                points[i].y;

        }

        return Math.abs(area) / 2;

    }

    function lineSegmentDistance(point, a, b) {

        const dx = b.x - a.x;
        const dy = b.y - a.y;

        const lengthSquared =
            dx * dx +
            dy * dy;

        if (!lengthSquared) {
            return distance(point, a);
        }

        let t =
            (
                (point.x - a.x) * dx +
                (point.y - a.y) * dy
            ) /
            lengthSquared;

        t =
            Math.max(
                0,
                Math.min(1, t)
            );

        const projection = {

            x: a.x + t * dx,
            y: a.y + t * dy

        };

        return distance(
            point,
            projection
        );

    }


    /* =====================================================
       ANALYSIS DEFINITIONS
    ===================================================== */

    window.pgAnalyses =
        Object.assign(
            window.pgAnalyses || {},
            {

                spatial_control: {

                    title:
                        "Spatial Control",

                    description:
                        "Measures how the pitch is divided between HOME control, AWAY control and contested space.",

                    requirements:
                        "HOME + AWAY players"

                },

                occupied_exposed_space: {

                    title:
                        "Occupied vs Exposed Space",

                    description:
                        "Separates the defensive footprint from the remaining space that may become available to the attacking team.",

                    requirements:
                        "HOME defenders + AWAY attackers"

                },

                attacking_access: {

                    title:
                        "Attacking Access",

                    description:
                        "Measures the attacking corridor toward goal and identifies defensive obstruction along that route.",

                    requirements:
                        "AWAY attackers + HOME defenders"

                },

                final_third_threat: {

                    title:
                        "Final Third Threat",

                    description:
                        "Identifies the most dangerous attacking pocket using goal proximity, defensive pressure and local density.",

                    requirements:
                        "AWAY attackers + HOME defenders"

                },

                pressure_field: {

                    title:
                        "Pressure Field",

                    description:
                        "Maps the defensive pressure around the ball or attacking player and identifies the available escape relationship.",

                    requirements:
                        "Ball + HOME defenders"

                }

            }
        );


    /* =====================================================
       RESULT FACTORY
    ===================================================== */

    function makeResult(data) {

        return Object.assign(

            {

                type:
                    "spatial",

                timestamp:
                    new Date().toISOString()

            },

            data

        );

    }

    function errorResult(message) {

        return {

            error: true,

            text: message,

            primary: "—",

            secondary: "—",

            relationship: "—"

        };

    }


    /* =====================================================
       SPACE
       SPACE BETWEEN LINES
    ===================================================== */

    function analyzeSpaceBetweenLines() {

        const home =
            getHomePlayers();

        const away =
            getAwayPlayers();

        if (
            home.length < 3 ||
            away.length < 2
        ) {

            return errorResult(
                "Add at least 3 HOME defenders and 2 AWAY attackers."
            );

        }

        const homeSorted =
            [...home].sort(
                (a, b) =>
                    Number(a.x) -
                    Number(b.x)
            );

        const awaySorted =
            [...away].sort(
                (a, b) =>
                    Number(a.x) -
                    Number(b.x)
            );

        const defensiveLine =
            homeSorted[
                homeSorted.length - 1
            ];

        const attackingLine =
            awaySorted[0];

        const lineGap =
            Math.abs(
                Number(attackingLine.x) -
                Number(defensiveLine.x)
            );

        const nearest =
            nearestPlayer(
                attackingLine,
                home
            );

        return makeResult({

            primary:
                lineGap.toFixed(1) +
                " m",

            secondary:
                nearest
                    ? nearest.distance.toFixed(1) + " m"
                    : "—",

            relationship:
                lineGap >= 15
                    ? "HIGH RECEIVING SPACE"
                    : lineGap >= 10
                        ? "AVAILABLE SPACE"
                        : "TIGHT SPACE",

            primaryLabel:
                "Line Gap",

            secondaryLabel:
                "Nearest Defender",

            relationshipLabel:
                "Receiving Space",

            geometry: {

                kind:
                    "between-lines",

                from:
                    defensiveLine,

                to:
                    attackingLine

            },

            text:
                `The spatial distance between the advanced HOME defensive line and the AWAY attacking line is ${lineGap.toFixed(1)} m. This creates ${lineGap >= 15 ? "a significant" : "a limited"} receiving corridor between the lines.`

        });

    }


    /* =====================================================
       SPACE
       SPATIAL CONTROL
    ===================================================== */

    function analyzeSpatialControl() {

        const home =
            getHomePlayers();

        const away =
            getAwayPlayers();

        if (
            !home.length ||
            !away.length
        ) {

            return errorResult(
                "Add players from both teams."
            );

        }

        const step = 3;

        let homeCells = 0;
        let awayCells = 0;
        let contestedCells = 0;

        for (
            let x = 0;
            x <= 105;
            x += step
        ) {

            for (
                let y = 0;
                y <= 68;
                y += step
            ) {

                const point = {
                    x,
                    y
                };

                const nearestHome =
                    nearestPlayer(
                        point,
                        home
                    );

                const nearestAway =
                    nearestPlayer(
                        point,
                        away
                    );

                if (
                    !nearestHome ||
                    !nearestAway
                ) {

                    continue;

                }

                const difference =
                    Math.abs(
                        nearestHome.distance -
                        nearestAway.distance
                    );

                if (
                    difference < 2
                ) {

                    contestedCells++;

                }
                else if (
                    nearestHome.distance <
                    nearestAway.distance
                ) {

                    homeCells++;

                }
                else {

                    awayCells++;

                }

            }

        }

        const total =
            homeCells +
            awayCells +
            contestedCells;

        const pitchArea =
            105 * 68;

        const homeArea =
            total
                ? homeCells / total * pitchArea
                : 0;

        const awayArea =
            total
                ? awayCells / total * pitchArea
                : 0;

        const contestedArea =
            total
                ? contestedCells / total * pitchArea
                : 0;

        return makeResult({

            primary:
                homeArea.toFixed(0) +
                " m²",

            secondary:
                awayArea.toFixed(0) +
                " m²",

            relationship:
                contestedArea.toFixed(0) +
                " m²",

            primaryLabel:
                "HOME Control",

            secondaryLabel:
                "AWAY Control",

            relationshipLabel:
                "Contested",

            text:
                `The proximity model estimates ${homeArea.toFixed(0)} m² under HOME influence, ${awayArea.toFixed(0)} m² under AWAY influence and ${contestedArea.toFixed(0)} m² as contested space.`

        });

    }


    /* =====================================================
       SPACE
       OCCUPIED VS EXPOSED
    ===================================================== */

    function analyzeOccupiedExposed() {

        const home =
            getHomePlayers();

        const away =
            getAwayPlayers();

        if (
            home.length < 3 ||
            away.length < 1
        ) {

            return errorResult(
                "Add at least 3 HOME defenders and 1 AWAY attacker."
            );

        }

        const points =
            home.map(
                p => ({
                    x: Number(p.x),
                    y: Number(p.y)
                })
            );

        const hull =
            convexHull(points);

        const occupied =
            polygonArea(hull);

        const exposed =
            Math.max(
                0,
                7140 - occupied
            );

        const attacker =
            away.reduce(
                (best, player) => {

                    const centerX =
                        points.reduce(
                            (sum, p) =>
                                sum + p.x,
                            0
                        ) /
                        points.length;

                    const centerY =
                        points.reduce(
                            (sum, p) =>
                                sum + p.y,
                            0
                        ) /
                        points.length;

                    const d =
                        distance(
                            player,
                            {
                                x: centerX,
                                y: centerY
                            }
                        );

                    if (
                        !best ||
                        d < best.d
                    ) {

                        return {
                            player,
                            d
                        };

                    }

                    return best;

                },
                null
            );

        const nearest =
            nearestPlayer(
                attacker.player,
                home
            );

        return makeResult({

            primary:
                occupied.toFixed(0) +
                " m²",

            secondary:
                exposed.toFixed(0) +
                " m²",

            relationship:
                nearest
                    ? nearest.distance.toFixed(1) +
                      " m"
                    : "—",

            primaryLabel:
                "Occupied",

            secondaryLabel:
                "Exposed",

            relationshipLabel:
                "Attacker Separation",

            geometry: {

                kind:
                    "occupied-exposed",

                hull,

                attacker:
                    attacker.player

            },

            text:
                `The HOME defensive footprint occupies approximately ${occupied.toFixed(0)} m². The remaining ${exposed.toFixed(0)} m² represents non-occupied pitch space, while the selected attacker is ${nearest ? nearest.distance.toFixed(1) : "—"} m from the nearest defender.`

        });

    }


    /* =====================================================
       ATTACK
       ATTACKING ACCESS
    ===================================================== */

    function analyzeAttackingAccess() {

        const home =
            getHomePlayers();

        const away =
            getAwayPlayers();

        if (
            home.length < 2 ||
            away.length < 1
        ) {

            return errorResult(
                "Add at least 2 HOME defenders and 1 AWAY attacker."
            );

        }

        const goal = {

            x: 105,
            y: 34

        };

        const attacker =
            away.reduce(
                (best, player) => {

                    const d =
                        distance(
                            player,
                            goal
                        );

                    if (
                        !best ||
                        d < best.d
                    ) {

                        return {
                            player,
                            d
                        };

                    }

                    return best;

                },
                null
            );

        const nearest =
            nearestPlayer(
                attacker.player,
                home
            );

        const blockers =
            home.filter(
                defender =>
                    lineSegmentDistance(
                        defender,
                        attacker.player,
                        goal
                    ) < 5
            );

        return makeResult({

            primary:
                attacker.d.toFixed(1) +
                " m",

            secondary:
                nearest
                    ? nearest.distance.toFixed(1) +
                      " m"
                    : "—",

            relationship:
                blockers.length === 0
                    ? "OPEN"
                    : blockers.length +
                      " BLOCKER" +
                      (
                          blockers.length > 1
                              ? "S"
                              : ""
                      ),

            primaryLabel:
                "Goal Distance",

            secondaryLabel:
                "Defender Separation",

            relationshipLabel:
                "Access Corridor",

            geometry: {

                kind:
                    "attacking-access",

                attacker:
                    attacker.player,

                goal,

                nearest:
                    nearest
                        ? nearest.player
                        : null,

                blockers

            },

            text:
                `The closest attacking player to goal is ${attacker.d.toFixed(1)} m away. The nearest defender is ${nearest ? nearest.distance.toFixed(1) : "—"} m away and ${blockers.length} defender(s) intersect the direct attacking corridor.`

        });

    }


    /* =====================================================
       ATTACK
       FINAL THIRD THREAT
    ===================================================== */

    function analyzeFinalThirdThreat() {

        const home =
            getHomePlayers();

        const away =
            getAwayPlayers();

        if (
            home.length < 2 ||
            away.length < 1
        ) {

            return errorResult(
                "Add at least 2 HOME defenders and 1 AWAY attacker."
            );

        }

        const finalThird =
            away.filter(
                player =>
                    Number(player.x) >= 70
            );

        const attackers =
            finalThird.length
                ? finalThird
                : away;

        const goal = {

            x: 105,
            y: 34

        };

        let best = null;

        attackers.forEach(
            attacker => {

                const goalDistance =
                    distance(
                        attacker,
                        goal
                    );

                const pressure =
                    nearestPlayer(
                        attacker,
                        home
                    );

                const localDensity =
                    home.filter(
                        defender =>
                            distance(
                                attacker,
                                defender
                            ) <= 12
                    ).length;

                const score =
                    (
                        1 /
                        (goalDistance + 1)
                    ) * 100
                    +
                    pressure.distance
                    -
                    localDensity * 2;

                if (
                    !best ||
                    score > best.score
                ) {

                    best = {

                        attacker,
                        goalDistance,
                        pressure,
                        localDensity,
                        score

                    };

                }

            }
        );

        return makeResult({

            primary:
                best.goalDistance.toFixed(1) +
                " m",

            secondary:
                best.pressure.distance.toFixed(1) +
                " m",

            relationship:
                best.localDensity +
                " DEFENDER" +
                (
                    best.localDensity !== 1
                        ? "S"
                        : ""
                ),

            primaryLabel:
                "Goal Distance",

            secondaryLabel:
                "Nearest Pressure",

            relationshipLabel:
                "Local Density",

            geometry: {

                kind:
                    "final-third-threat",

                attacker:
                    best.attacker,

                goal,

                nearest:
                    best.pressure.player

            },

            text:
                `The most threatening attacking pocket is ${best.goalDistance.toFixed(1)} m from goal, with the nearest defender ${best.pressure.distance.toFixed(1)} m away and ${best.localDensity} defender(s) within a 12 m local pressure radius.`

        });

    }


    /* =====================================================
       ATTACK
       PRESSURE FIELD
    ===================================================== */

    function analyzePressureField() {

        const home =
            getHomePlayers();

        if (
            home.length < 2
        ) {

            return errorResult(
                "Add at least 2 HOME defenders."
            );

        }

        const target =
            getBall() ||
            getAwayPlayers()[0];

        if (!target) {

            return errorResult(
                "Place the ball or add an AWAY attacker."
            );

        }

        const nearest =
            nearestPlayer(
                target,
                home
            );

        const defendersSorted =
            home
                .map(
                    defender => ({
                        defender,
                        d:
                            distance(
                                target,
                                defender
                            )
                    })
                )
                .sort(
                    (a, b) =>
                        a.d - b.d
                );

        const second =
            defendersSorted[1] || null;

        const pressureRadius =
            nearest
                ? nearest.distance
                : 0;

        return makeResult({

            primary:
                nearest
                    ? nearest.distance.toFixed(1) +
                      " m"
                    : "—",

            secondary:
                second
                    ? second.d.toFixed(1) +
                      " m"
                    : "—",

            relationship:
                pressureRadius <= 5
                    ? "HIGH PRESSURE"
                    : pressureRadius <= 8
                        ? "MEDIUM PRESSURE"
                        : "LOW PRESSURE",

            primaryLabel:
                "Nearest Pressure",

            secondaryLabel:
                "Second Defender",

            relationshipLabel:
                "Pressure State",

            geometry: {

                kind:
                    "pressure-field",

                target,

                nearest:
                    nearest
                        ? nearest.player
                        : null,

                second:
                    second
                        ? second.defender
                        : null

            },

            text:
                `The target is ${nearest ? nearest.distance.toFixed(1) : "—"} m from the nearest HOME defender and ${second ? second.d.toFixed(1) : "—"} m from the second defender. The current spatial pressure state is classified as ${pressureRadius <= 5 ? "high" : pressureRadius <= 8 ? "medium" : "low"}.`

        });

    }


    /* =====================================================
       ATTACH ANALYSIS FUNCTIONS
    ===================================================== */

    window.pgCustomAnalyses = {

        space_between_lines:
            analyzeSpaceBetweenLines,

        spatial_control:
            analyzeSpatialControl,

        occupied_exposed_space:
            analyzeOccupiedExposed,

        attacking_access:
            analyzeAttackingAccess,

        final_third_threat:
            analyzeFinalThirdThreat,

        pressure_field:
            analyzePressureField

    };


    /* =====================================================
       ADD MISSING BUTTONS
    ===================================================== */

    function addMissingButtons() {

        const groups =
            document.querySelectorAll(
                ".question-group"
            );

        groups.forEach(
            group => {

                const header =
                    (
                        group
                            .querySelector(
                                ".question-group-header"
                            )
                            ?.innerText ||
                        ""
                    ).toUpperCase();

                const content =
                    group.querySelector(
                        ".question-group-content"
                    );

                if (!content) {
                    return;
                }

                function addButton(
                    id,
                    title,
                    description
                ) {

                    const exists =
                        [...content.querySelectorAll(
                            ".question-item"
                        )]
                        .some(
                            button =>
                                (
                                    button.getAttribute(
                                        "onclick"
                                    ) || ""
                                )
                                .includes(
                                    `'${id}'`
                                )
                        );

                    if (exists) {
                        return;
                    }

                    const button =
                        document.createElement(
                            "button"
                        );

                    button.type =
                        "button";

                    button.className =
                        "question-item";

                    button.setAttribute(
                        "onclick",
                        `pgSelectAnalysis('${id}')`
                    );

                    button.innerHTML = `

                        <span class="question-item-title">
                            ${title}
                        </span>

                        <span class="question-item-description">
                            ${description}
                        </span>

                    `;

                    content.appendChild(
                        button
                    );

                }

                if (
                    header.includes(
                        "SPACE"
                    )
                ) {

                    addButton(
                        "occupied_exposed_space",
                        "Occupied vs Exposed Space",
                        "Occupied · Exposed · Access"
                    );

                }

                if (
                    header.includes(
                        "ATTACK"
                    )
                ) {

                    addButton(
                        "attacking_access",
                        "Attacking Access",
                        "Corridor · Access · Goal"
                    );

                    addButton(
                        "final_third_threat",
                        "Final Third Threat",
                        "Density · Access · Threat"
                    );

                    addButton(
                        "pressure_field",
                        "Pressure Field",
                        "Pressure · Escape · Radius"
                    );

                }

            }
        );

    }


    /* =====================================================
       DRAW CUSTOM RESULT
       NOTE:
       DOES NOT CREATE A NEW MAP
       DOES NOT TOUCH PITCH
    ===================================================== */

    function drawCustomResult(
        analysisId,
        result
    ) {

        if (
            typeof window.map ===
            "undefined" ||
            !window.map
        ) {

            return;

        }

        if (
            !window.L
        ) {

            return;

        }

        if (
            !window.pgCustomLayer
        ) {

            window.pgCustomLayer =
                L.layerGroup().addTo(
                    window.map
                );

        }

        window.pgCustomLayer.clearLayers();

        const g =
            result.geometry;

        if (!g) {
            return;
        }


        /* ---------------------------------------------
           BETWEEN LINES
        --------------------------------------------- */

        if (
            g.kind ===
            "between-lines"
        ) {

            L.polyline(
                [
                    [
                        g.from.y,
                        g.from.x
                    ],
                    [
                        g.to.y,
                        g.to.x
                    ]
                ],
                {
                    color:
                        "#0284c7",

                    weight:
                        3,

                    dashArray:
                        "7,6"
                }
            ).addTo(
                window.pgCustomLayer
            );

        }


        /* ---------------------------------------------
           OCCUPIED / EXPOSED
        --------------------------------------------- */

        if (
            g.kind ===
            "occupied-exposed"
        ) {

            if (
                g.hull &&
                g.hull.length >= 3
            ) {

                L.polygon(
                    g.hull.map(
                        p => [
                            p.y,
                            p.x
                        ]
                    ),
                    {
                        color:
                            "#17845b",

                        weight:
                            2,

                        fillOpacity:
                            0.08
                    }
                ).addTo(
                    window.pgCustomLayer
                );

            }

            L.circleMarker(
                [
                    g.attacker.y,
                    g.attacker.x
                ],
                {
                    radius:
                        7,

                    color:
                        "#0284c7",

                    fillOpacity:
                        0.9
                }
            ).addTo(
                window.pgCustomLayer
            );

        }


        /* ---------------------------------------------
           ATTACKING ACCESS
        --------------------------------------------- */

        if (
            g.kind ===
            "attacking-access"
        ) {

            L.polyline(
                [
                    [
                        g.attacker.y,
                        g.attacker.x
                    ],
                    [
                        g.goal.y,
                        g.goal.x
                    ]
                ],
                {
                    color:
                        "#0284c7",

                    weight:
                        3,

                    dashArray:
                        "8,6"
                }
            ).addTo(
                window.pgCustomLayer
            );

            g.blockers.forEach(
                blocker => {

                    L.circleMarker(
                        [
                            blocker.y,
                            blocker.x
                        ],
                        {
                            radius:
                                6,

                            color:
                                "#ef4444",

                            fillOpacity:
                                0.8
                        }
                    ).addTo(
                        window.pgCustomLayer
                    );

                }
            );

        }


        /* ---------------------------------------------
           FINAL THIRD THREAT
        --------------------------------------------- */

        if (
            g.kind ===
            "final-third-threat"
        ) {

            L.circle(
                [
                    g.attacker.y,
                    g.attacker.x
                ],
                {
                    radius:
                        8,

                    color:
                        "#0284c7",

                    fillOpacity:
                        0.12,

                    weight:
                        2
                }
            ).addTo(
                window.pgCustomLayer
            );

            L.polyline(
                [
                    [
                        g.attacker.y,
                        g.attacker.x
                    ],
                    [
                        g.goal.y,
                        g.goal.x
                    ]
                ],
                {
                    color:
                        "#0284c7",

                    weight:
                        2,

                    dashArray:
                        "5,5"
                }
            ).addTo(
                window.pgCustomLayer
            );

        }


        /* ---------------------------------------------
           PRESSURE FIELD
        --------------------------------------------- */

        if (
            g.kind ===
            "pressure-field"
        ) {

            L.circle(
                [
                    g.target.y,
                    g.target.x
                ],
                {
                    radius:
                        8,

                    color:
                        "#ef4444",

                    fillOpacity:
                        0.06,

                    weight:
                        2
                }
            ).addTo(
                window.pgCustomLayer
            );

            if (
                g.nearest
            ) {

                L.polyline(
                    [
                        [
                            g.target.y,
                            g.target.x
                        ],
                        [
                            g.nearest.y,
                            g.nearest.x
                        ]
                    ],
                    {
                        color:
                            "#ef4444",

                        weight:
                            3
                    }
                ).addTo(
                    window.pgCustomLayer
                );

            }

            if (
                g.second
            ) {

                L.polyline(
                    [
                        [
                            g.target.y,
                            g.target.x
                        ],
                        [
                            g.second.y,
                            g.second.x
                        ]
                    ],
                    {
                        color:
                            "#f59e0b",

                        weight:
                            2,

                        dashArray:
                            "5,5"
                    }
                ).addTo(
                    window.pgCustomLayer
                );

            }

        }

    }


    /* =====================================================
       UPDATE GEOMETRY TAB
    ===================================================== */

    function updateGeometryTab(
        result
    ) {

        const tab =
            pgx(
                "tab-geometry"
            );

        if (!tab) {
            return;
        }

        let detail =
            tab.querySelector(
                ".pg-geometry-detail"
            );

        if (!detail) {

            detail =
                document.createElement(
                    "div"
                );

            detail.className =
                "pg-geometry-detail";

            tab.appendChild(
                detail
            );

        }

        detail.innerHTML = `

            <div class="evidence-detail-grid">

                <div>
                    <small>
                        PRIMARY
                    </small>

                    <b>
                        ${escapeHTML(
                            result.primaryLabel ||
                            "Metric"
                        )}
                    </b>

                    <span>
                        ${escapeHTML(
                            result.primary ||
                            "—"
                        )}
                    </span>
                </div>


                <div>
                    <small>
                        SECONDARY
                    </small>

                    <b>
                        ${escapeHTML(
                            result.secondaryLabel ||
                            "Metric"
                        )}
                    </b>

                    <span>
                        ${escapeHTML(
                            result.secondary ||
                            "—"
                        )}
                    </span>
                </div>


                <div>
                    <small>
                        RELATIONSHIP
                    </small>

                    <b>
                        ${escapeHTML(
                            result.relationshipLabel ||
                            "Spatial Relationship"
                        )}
                    </b>

                    <span>
                        ${escapeHTML(
                            result.relationship ||
                            "—"
                        )}
                    </span>
                </div>

            </div>


            <p class="evidence-method">

                ${escapeHTML(
                    result.text ||
                    ""
                )}

            </p>

        `;

    }


    /* =====================================================
       TACTICAL STORY
    ===================================================== */

    function updateTacticalStory(
        result,
        analysis
    ) {

        setText(
            "storyWhat",
            result.text ||
            analysis.description
        );

        setText(
            "storyWhy",

            `The important spatial signal is ${
                result.primaryLabel ||
                "the primary measure"
            } at ${
                result.primary ||
                "—"
            }. This changes the interpretation from a simple player position into a measurable spatial relationship.`
        );

        setText(
            "storyTactical",

            `The ${
                result.relationshipLabel ||
                "spatial relationship"
            } is ${
                result.relationship ||
                "—"
            }. The tactical consequence should be interpreted through defensive structure, attacking access, pressure and the position of the ball.`
        );

    }


    /* =====================================================
       SCENE SEQUENCE
    ===================================================== */

    function updateSceneSequence(
        result
    ) {

        const tab =
            pgx(
                "tab-sequence"
            );

        if (!tab) {
            return;
        }

        const track =
            tab.querySelector(
                ".sequence-track"
            );

        if (!track) {
            return;
        }

        track.innerHTML = `

            <div class="active">

                <b>01</b>

                <span>
                    SETUP
                </span>

                <small>
                    Player + ball positions
                </small>

            </div>

            <i></i>


            <div class="active">

                <b>02</b>

                <span>
                    STRUCTURE
                </span>

                <small>
                    Defensive organization
                </small>

            </div>

            <i></i>


            <div class="active">

                <b>03</b>

                <span>
                    DEFORMATION
                </span>

                <small>
                    ${escapeHTML(
                        result.primaryLabel ||
                        "Spatial signal"
                    )}
                </small>

            </div>

            <i></i>


            <div class="active">

                <b>04</b>

                <span>
                    ACCESS
                </span>

                <small>
                    ${escapeHTML(
                        result.relationship ||
                        "Spatial relationship"
                    )}
                </small>

            </div>

            <i></i>


            <div>

                <b>05</b>

                <span>
                    CONSEQUENCE
                </span>

                <small>
                    Tactical interpretation
                </small>

            </div>

        `;

    }


    /* =====================================================
       SPATIAL ENGINE
    ===================================================== */

    function updateSpatialEngine(
        analysis
    ) {

        const tab =
            pgx(
                "tab-engine"
            );

        if (!tab) {
            return;
        }

        const grid =
            tab.querySelector(
                ".engine-grid"
            );

        if (!grid) {
            return;
        }

        grid.innerHTML = `

            <div>

                <small>
                    SPATIAL FUNCTIONS
                </small>

                <strong>
                    ST_Distance()
                </strong>

                <strong>
                    ST_DWithin()
                </strong>

                <strong>
                    ST_Intersects()
                </strong>

                <strong>
                    ST_ConvexHull()
                </strong>

            </div>


            <div>

                <small>
                    INPUT
                </small>

                <strong>
                    Player Points
                </strong>

                <strong>
                    Ball Point
                </strong>

                <strong>
                    Team / Position
                </strong>

                <span>
                    SRID 0 · 105 × 68 m
                </span>

            </div>


            <div>

                <small>
                    OUTPUT
                </small>

                <strong>
                    Geometry
                </strong>

                <strong>
                    Metrics
                </strong>

                <strong>
                    Tactical Interpretation
                </strong>

                <span>
                    ${escapeHTML(
                        analysis.title ||
                        "Spatial Analysis"
                    )}
                </span>

            </div>

        `;

    }


    /* =====================================================
       UPDATE EVIDENCE
    ===================================================== */

    function updateEvidence() {

        const result =
            window.pgAnalysisResult;

        const analysis =
            window.pgAnalyses?.[
                window.pgCurrentAnalysis
            ];

        if (
            !result ||
            !analysis ||
            result.error
        ) {

            return;

        }

        setText(
            "evidenceTitle",
            analysis.title
        );

        setText(
            "evidenceHeadline",
            "SPATIAL RESULT"
        );

        setText(
            "evidenceDescription",
            result.text ||
            analysis.description
        );

        setText(
            "evidenceSignal",
            "INTERPRETED"
        );

        setText(
            "metricExposure",
            result.primary ||
            "—"
        );

        setText(
            "metricArea",
            result.secondary ||
            "—"
        );

        setText(
            "metricNearest",
            result.relationship ||
            "—"
        );

        setText(
            "metricStructure",
            "ACTIVE"
        );

        updateGeometryTab(
            result
        );

        updateTacticalStory(
            result,
            analysis
        );

        updateSceneSequence(
            result
        );

        updateSpatialEngine(
            analysis
        );

        const evidence =
            pgx(
                "spatialEvidence"
            );

        if (evidence) {

            evidence.classList.add(
                "interpreted"
            );

        }

    }


    /* =====================================================
       PITCHGRID ARTICLE
    ===================================================== */

    window.pgOpenArticle =
        function () {

            const result =
                window.pgAnalysisResult;

            const analysis =
                window.pgAnalyses?.[
                    window.pgCurrentAnalysis
                ];

            const output =
                pgx(
                    "audienceOutput"
                );

            if (!output) {
                return;
            }

            if (
                !result ||
                result.error
            ) {

                output.innerHTML = `

                    <div class="audience-result">

                        <strong>
                            RUN AN ANALYSIS FIRST
                        </strong>

                        <p>
                            Place the players and ball,
                            select a spatial question,
                            then run the analysis.
                        </p>

                    </div>

                `;

                return;

            }

            const home =
                getHomePlayers();

            const away =
                getAwayPlayers();

            const ball =
                getBall();

            const homeBounds =
                getBounds(home);

            const awayBounds =
                getBounds(away);

            const title =
                analysis?.title ||
                "Spatial Match Scene";

            output.innerHTML = `

                <article class="pitchgrid-article">

                    <div class="article-eyebrow">

                        PITCHGRID ARTICLE ·
                        ${escapeHTML(
                            title.toUpperCase()
                        )}

                    </div>


                    <h3>

                        ${escapeHTML(
                            title
                        )}

                    </h3>


                    <p class="article-deck">

                        This snapshot is treated as
                        a spatial football scene.
                        PitchGrid reconstructs the
                        relationships between players,
                        space, pressure, access and
                        tactical consequence.

                    </p>


                    <div class="article-flow">

                        <span>
                            STRUCTURE
                        </span>

                        <i>→</i>

                        <span>
                            SHIFT
                        </span>

                        <i>→</i>

                        <span>
                            GAP
                        </span>

                        <i>→</i>

                        <span>
                            ACCESS
                        </span>

                        <i>→</i>

                        <span>
                            ACTION
                        </span>

                    </div>


                    <section>

                        <small>
                            01 · THE MOMENT
                        </small>

                        <h4>
                            What was happening?
                        </h4>

                        <p>

                            ${
                                escapeHTML(
                                    result.text ||
                                    analysis.description
                                )
                            }

                        </p>

                    </section>


                    <section>

                        <small>
                            02 · THE SPATIAL QUESTION
                        </small>

                        <h4>
                            What geometry matters?
                        </h4>

                        <p>

                            PitchGrid evaluates
                            distance, separation,
                            control, pressure and
                            access instead of looking
                            only at the final football
                            action.

                        </p>

                    </section>


                    <section>

                        <small>
                            03 · INITIAL STRUCTURE
                        </small>

                        <h4>
                            How was the scene organized?
                        </h4>

                        <p>

                            HOME players:
                            ${home.length}.

                            AWAY players:
                            ${away.length}.

                            ${
                                ball
                                    ? "The ball position is included in the snapshot."
                                    : "No ball position has been placed yet."
                            }

                        </p>

                        <p>

                            HOME footprint:
                            ${
                                homeBounds
                                    ? (
                                        (
                                            homeBounds.maxX -
                                            homeBounds.minX
                                        ).toFixed(1)
                                        +
                                        " m width × "
                                        +
                                        (
                                            homeBounds.maxY -
                                            homeBounds.minY
                                        ).toFixed(1)
                                        +
                                        " m depth"
                                    )
                                    : "insufficient data"
                            }

                        </p>

                        <p>

                            AWAY footprint:
                            ${
                                awayBounds
                                    ? (
                                        (
                                            awayBounds.maxX -
                                            awayBounds.minX
                                        ).toFixed(1)
                                        +
                                        " m width × "
                                        +
                                        (
                                            awayBounds.maxY -
                                            awayBounds.minY
                                        ).toFixed(1)
                                        +
                                        " m depth"
                                    )
                                    : "insufficient data"
                            }

                        </p>

                    </section>


                    <section>

                        <small>
                            04 · CRITICAL SPATIAL SIGNAL
                        </small>

                        <h4>

                            ${
                                escapeHTML(
                                    result.primaryLabel ||
                                    "Primary Metric"
                                )
                            }

                        </h4>

                        <p>

                            ${
                                escapeHTML(
                                    result.primary ||
                                    "—"
                                )
                            }

                            ·

                            ${
                                escapeHTML(
                                    result.secondaryLabel ||
                                    "Secondary"
                                )
                            }

                            :

                            ${
                                escapeHTML(
                                    result.secondary ||
                                    "—"
                                )
                            }

                            ·

                            ${
                                escapeHTML(
                                    result.relationshipLabel ||
                                    "Relationship"
                                )
                            }

                            :

                            ${
                                escapeHTML(
                                    result.relationship ||
                                    "—"
                                )
                            }

                        </p>

                    </section>


                    <section>

                        <small>
                            05 · TACTICAL CONSEQUENCE
                        </small>

                        <h4>
                            Why did the geometry matter?
                        </h4>

                        <p>

                            The spatial result should
                            be read as a relationship
                            between players rather than
                            as an isolated number.

                            ${
                                escapeHTML(
                                    result.text ||
                                    ""
                                )
                            }

                        </p>

                    </section>


                    <section>

                        <small>
                            06 · MATCH CHAIN
                        </small>

                        <h4>
                            From geometry to action
                        </h4>

                        <p>

                            SPATIAL STRUCTURE

                            →
                            DEFENSIVE DEFORMATION

                            →
                            GAP / ACCESS

                            →
                            PASSING OPTION

                            →
                            LINE BREAK

                            →
                            FINAL ACTION

                        </p>

                    </section>


                    <section>

                        <small>
                            07 · PITCHGRID CONCLUSION
                        </small>

                        <h4>
                            The scene is the story.
                        </h4>

                        <p>

                            PitchGrid converts a football
                            snapshot into spatial evidence,
                            then connects that evidence to
                            a tactical explanation.

                            The final match interpretation
                            should combine the geometry on
                            the pitch with the sequence
                            surrounding the moment.

                        </p>

                    </section>

                </article>

            `;

            output.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "nearest"

            });

        };


    /* =====================================================
       AUDIENCE REPORTS
    ===================================================== */

    window.pgBuildAudience =
        function (mode) {

            const result =
                window.pgAnalysisResult;

            const analysis =
                window.pgAnalyses?.[
                    window.pgCurrentAnalysis
                ];

            const output =
                pgx(
                    "audienceOutput"
                );

            if (!output) {
                return;
            }

            if (
                !result ||
                result.error
            ) {

                output.innerHTML = `

                    <div class="audience-result">

                        <strong>
                            RUN AN ANALYSIS FIRST
                        </strong>

                    </div>

                `;

                return;

            }

            let heading =
                "FAN STORY";

            let body = "";

            if (
                mode ===
                "coach"
            ) {

                heading =
                    "COACH REPORT";

                body = `

                    The key coaching signal is
                    ${
                        result.primaryLabel ||
                        "the primary spatial metric"
                    }
                    at
                    ${
                        result.primary ||
                        "—"
                    }.

                    The ${
                        result.relationshipLabel ||
                        "spatial relationship"
                    }
                    is
                    ${
                        result.relationship ||
                        "—"
                    }.

                    The practical question is how
                    the team can protect this space,
                    reduce attacking access or
                    exploit the same spatial weakness.

                `;

            }
            else if (
                mode ===
                "analyst"
            ) {

                heading =
                    "PERFORMANCE ANALYST REPORT";

                body = `

                    The snapshot produced
                    ${
                        result.primaryLabel ||
                        "a primary spatial signal"
                    }
                    of
                    ${
                        result.primary ||
                        "—"
                    },

                    with
                    ${
                        result.secondaryLabel ||
                        "a secondary measure"
                    }
                    of
                    ${
                        result.secondary ||
                        "—"
                    }.

                    The measured relationship is
                    ${
                        result.relationship ||
                        "—"
                    }.

                    ${
                        result.text ||
                        ""
                    }

                `;

            }
            else {

                body = `

                    The interesting part of this
                    football moment is not only the
                    final action.

                    It is the space that existed
                    before the action happened.

                    ${
                        result.text ||
                        analysis.description
                    }

                `;

            }

            output.innerHTML = `

                <div class="audience-result">

                    <div class="audience-type">

                        ${heading}

                    </div>


                    <h3>

                        ${escapeHTML(
                            analysis?.title ||
                            "Spatial Analysis"
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            body
                        )}

                    </p>


                    <div class="audience-metrics">

                        <span>

                            ${escapeHTML(
                                result.primary ||
                                "—"
                            )}

                        </span>

                        <span>

                            ${escapeHTML(
                                result.secondary ||
                                "—"
                            )}

                        </span>

                        <span>

                            ${escapeHTML(
                                result.relationship ||
                                "—"
                            )}

                        </span>

                    </div>

                </div>

            `;

        };


    /* =====================================================
       OVERRIDE RUN ANALYSIS
    ===================================================== */

    const originalRun =
        window.pgRunAnalysis;

    window.pgRunAnalysis =
        function () {

            const id =
                window.pgCurrentAnalysis;

            const customFunction =
                window.pgCustomAnalyses[
                    id
                ];

            if (
                typeof customFunction ===
                "function"
            ) {

                const result =
                    customFunction();

                if (!result) {
                    return;
                }

                window.pgAnalysisResult =
                    result;

                if (
                    result.error
                ) {

                    if (
                        typeof window.pgShowPlacementMessage ===
                        "function"
                    ) {

                        window.pgShowPlacementMessage(
                            result.text
                        );

                    }

                    return;

                }

                drawCustomResult(
                    id,
                    result
                );

                updateEvidence();

                if (
                    typeof window.pgUpdateScenarioUI ===
                    "function"
                ) {

                    window.pgUpdateScenarioUI();

                }

                if (
                    typeof window.pgShowPlacementMessage ===
                    "function"
                ) {

                    window.pgShowPlacementMessage(
                        "Spatial analysis completed"
                    );

                }

                return;

            }


            if (
                typeof originalRun ===
                "function"
            ) {

                originalRun();

            }

            setTimeout(
                updateEvidence,
                100
            );

            setTimeout(
                updateEvidence,
                500
            );

        };


    /* =====================================================
       SELECT ANALYSIS
    ===================================================== */

    const originalSelect =
        window.pgSelectAnalysis;

    if (
        typeof originalSelect ===
        "function"
    ) {

        window.pgSelectAnalysis =
            function (id) {

                originalSelect(id);

                const analysis =
                    window.pgAnalyses?.[id];

                if (analysis) {

                    setText(
                        "evidenceTitle",
                        analysis.title
                    );

                    setText(
                        "evidenceHeadline",
                        "QUESTION SELECTED"
                    );

                    setText(
                        "evidenceDescription",
                        analysis.description
                    );

                    setText(
                        "evidenceSignal",
                        "READY"
                    );

                }

                document
                    .querySelectorAll(
                        ".question-item"
                    )
                    .forEach(
                        button => {

                            const onclick =
                                button.getAttribute(
                                    "onclick"
                                ) || "";

                            button.classList.toggle(
                                "selected",
                                onclick.includes(
                                    `'${id}'`
                                )
                            );

                        }
                    );

            };

    }


    /* =====================================================
       EVIDENCE TABS
    ===================================================== */

    document.addEventListener(
        "click",
        function (event) {

            const tab =
                event.target.closest(
                    ".evidence-tab"
                );

            if (!tab) {
                return;
            }

            const name =
                tab.dataset.tab;

            document
                .querySelectorAll(
                    ".evidence-tab"
                )
                .forEach(
                    button =>
                        button.classList.toggle(
                            "active",
                            button === tab
                        )
                );

            document
                .querySelectorAll(
                    ".evidence-content"
                )
                .forEach(
                    content =>
                        content.classList.toggle(
                            "active",
                            content.id ===
                            `tab-${name}`
                        )
                );

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initializePitchGridPatch() {

        addMissingButtons();

        if (
            window.pgAnalysisResult
        ) {

            setTimeout(
                updateEvidence,
                100
            );

        }

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializePitchGridPatch
        );

    }
    else {

        initializePitchGridPatch();

    }


})();


