import { Parser, parserFromWasm, isSetup } from "./parser.js"
import javascript from "https://github.com/jeff-hykin/common_tree_sitter_languages/raw/676ffa3b93768b8ac628fd5c61656f7dc41ba413/main/javascript.js"
let parserSetupPromise = isSetup.then(()=>parserFromWasm(javascript))

// const isMacOS = navigator.userAgent.includes('Macintosh') || navigator.userAgent.includes('Mac OS X');
// it doesn't like opera for some reason
// if (navigator.userAgent.includes(' OPR/')) {
//     var userAgent = navigator.userAgent
//     userAgent = userAgent.replace(/ OPR\/\d+\.\d+\.\d+\.\d+/, '')
//     console.debug(`userAgent is:`,userAgent)
//     Object.defineProperty(navigator, "userAgent", { get() { return userAgent } })
//     const realBrands = navigator.userAgentData.brands
//     console.debug(`realBrands is:`,realBrands)
//     Object.defineProperty(navigator.userAgentData, "brands", { get() { return [ realBrands[0] ] } })
//     const userAgentData = navigator.userAgentData
//     Object.defineProperty(navigator, "userAgentData", { get() { return {...userAgentData, brands: [realBrands[0]]} } })
// }

// 
// monaco setup
// 
let interval = setInterval(async () => {
    var parser = await parserSetupPromise
    var tree
    // console.debug(`globalThis.monaco is:`,globalThis.monaco)
    if (globalThis.monaco) {
        var buttons = [...document.querySelectorAll('button')]
        var runButton = buttons.find(each=>each.innerText.includes('Run Code'))
        var submitButton = buttons.find(each=>each.innerText.includes('Submit Code'))
        // ctrl+enter = basic run
        document.addEventListener('keydown', function(event) {
            if (isMacOS && event.ctrlKey && event.key === 'Enter') {
                runButton.click()
            }
        })
        // ctrl+shift+enter = submit
        document.addEventListener('keydown', function(event) {
            if (isMacOS && event.ctrlKey && event.shiftKey && event.key === 'Enter') {
                submitButton.click()
            }
        })

        clearInterval(interval)
        let monaco = globalThis.monaco
        var editor = monaco.editor.getEditors()[0]
        
        // 
        // settings
        // 
        editor.updateOptions({
            // suggestSelection: "recentlyUsedByPrefix",
            snippetSuggestions: "top",
            quickSuggestionsDelay: 0,
            quickSuggestions: {
                comments: true,
                other: true,
                strings: true,
            },
        })

        //
        // keybinds
        //
            editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyZ, function () {
                editor.getAction("workbench.action.navigateBack").run()
            })
            editor.addCommand(monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ, function () {
                editor.getAction("workbench.action.navigateForward").run()
            })
            editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.BracketLeft, function () {
                editor.getAction("editor.action.jumpToBracket").run()
            })
            editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.BracketRight, function () {
                editor.getAction("editor.action.jumpToBracket").run()
            })
            editor.addCommand(monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.BracketLeft, function () {
                editor.getAction("editor.action.selectToBracket").run()
            })
            editor.addCommand(monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.BracketRight, function () {
                editor.getAction("editor.action.selectToBracket").run()
            })
            editor.addCommand(monaco.KeyMod.CmdCtrl | monaco.KeyMod.Shift | monaco.KeyCode.Enter, function () {
                editor.getAction("editor.action.changeAll").run()
            })
            
            // tried to do multi-cursor fix for firefox, but it didnt work (might be a Zen Browser / MacOS problem)
            // editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.DownArrow, () => {
            //     const selections = editor.getSelections()
            //     const newSelections = []
            //
            //     console.log(`here`)
            //
            //     for (const sel of selections) {
            //         let line = sel.positionLineNumber + 1
            //         if (line <= editor.getModel().getLineCount()) {
            //             newSelections.push(new monaco.Selection(line, sel.positionColumn, line, sel.positionColumn))
            //         } else {
            //             newSelections.push(sel)
            //         }
            //     }
            //
            //     editor.setSelections(selections.concat(newSelections))
            // })
        
        // 
        // snippets
        // 
        var suggestions = {
            "print": {
                prefix: "print",
                body: ["console.log(`$1`)"],
                description: "Print text to console",
            },
            "outt": {
                prefix: "outt",
                body: ["console.debug(`$1 is:`,$1)"],
                description: "Debug output to console",
            },
            if: {
                prefix: "if",
                body: ["if ($0) {", "    ", "}"],
            },
            else: {
                prefix: "else",
                body: [" else {", "    $0", "}"],
            },
            "else if": {
                prefix: "eif",
                body: [" else if ($1) {", "    ", "}"],
            },
            whilei: {
                prefix: "whilei",
                body: [
                    "let i=-1",
                    "while (i<$0) {",
                    "    i+=1",
                    "    ",
                    "}"
                ],
            },
            fori: {
                prefix: "fori",
                body: [
                    "for (let i=0; i<$0; i++) {",
                    "    ",
                    "}"
                ],
            },
            "forof loop": {
                prefix: "forof",
                body: ["for (let each of $0) {", "    ", "}"],
                description: "creates a for loop",
            },
            "forentries loop": {
                prefix: "forentries",
                body: ["for (const [key, value] of Object.entries($0)) {", "", "}"],
                description: "creates a for loop",
            },
            try: {
                prefix: "try",
                body: ["try {", "    ", "} catch (error) {", "    ", "}"],
                description: "creates a for loop",
            },
            sleep: {
                prefix: "sleep",
                body: ["await new Promise(r=>setTimeout(r,${1:100}))"],
            },
            time: {
                prefix: "time",
                body: ["const startTime = (new Date()).getTime()", "$1", "const endTime = (new Date()).getTime()", "const duration = endTime - startTime", "${2:console.log(`$3 took \\${duration\\}ms`)}"],
            },
            def_zip: {
                prefix: "def_zip",
                body: ["function zip(...iterables) {", "    const innerIterZipLongSync = function* (...iterables) {", "        while (true) {", "            const nexts = iterables.map((each) => each.next())", "            // if all are done then stop", "            if (nexts.every((each) => each.done)) {", "                break", "            }", "            yield nexts.map((each) => each.value)", "        }", "    }", "    return [...innerIterZipLongSync(...iterables.map(each=>each[Symbol.iterator]()))]", "}", "$0"],
            },
            def_spread: {
                prefix: "def_spread",
                body: ["const spread = ({quantity, min, max, decimals=5}) => {\n    const range = max-min\n    const increment = range / quantity\n    const values = [ min.toFixed(decimals)-0 ]\n    let index = 0\n    const valueAt = (index) => min + (increment * index)\n    while (valueAt(index) < max) {\n        values.push(valueAt(index++).toFixed(decimals)-0)\n    }\n    values.push(max.toFixed(decimals)-0)\n    return values\n}\n//ex: spread({quantity, min, max,})"],
            },
            def_sum: {
                prefix: "def_sum",
                body: ["const sum = (list) => list.reduce((a, b) => (a-0) + (b-0), 0)"],
            },
            def_product: {
                prefix: "def_product",
                body: ["const product = (list) => list.reduce((a, b) => (a-0) * (b-0), 0)"],
            },
            def_average: {
                prefix: "def_average",
                body: ["const average = (list) => (list.reduce((a, b) => (a-0) + (b-0), 0))/list.length"],
            },
            def_factorial: {
                prefix: "def_factorial",
                body: ["function factorial(n) {\n    if (n < 0) throw new Error(\"Negative numbers are not allowed.\");\n    let result = 1;\n    for (let i = 2; i <= n; i++) {\n        result *= i;\n    }\n    return result;\n}"],
            },
            def_modulo: {
                prefix: "def_modulo",
                body: ["function mod(n, m) {\n    let r = n % m;\n    if ((r > 0 && m < 0) || (r < 0 && m > 0)) {\n        r += m;\n    }\n    return r;\n}"],
            },
            def_getIntBit: {
                prefix: "def_getIntBit",
                body: ["function getIntBit(number, bitIndex) {\n    return number >> bitIndex & 1\n}\n//ex: getIntBit(number, bitIndex)"],
            },
            def_setIntBit: {
                prefix: "def_setIntBit",
                body: ["function setIntBit(number, bitIndex, value=1) {\n    if (value) {\n        return number | (1 << bitIndex)\n    } else {\n        return ~(~number | (1 << bitIndex))\n    }\n}\n//ex: setIntBit(number, bitIndex, value)"],
            },
            stringToUint8Array: {
                prefix: "stringToUint8Array",
                body: ["new TextEncoder().encode(${1:string})"],
            },
            uint8ArrayToString: {
                prefix: "uint8ArrayToString",
                body: ["new TextDecoder().decode(${1:array})"],
            },
            wrapAroundGet: {
                body: "function wrapAroundGet(number, list) { return list[((number % list.length) + list.length) % list.length] }"
            },
            "def_binary_search": {
                "prefix": "binary_search",
                "description": "binary_search",
                "body": [
                            "function binarySearch(params) {",
                            "    let { in: list, find: targetValue, toValue, isSorted } = params",
                            "    toValue = toValue || ((a)=>a)",
                            "    if (!isSorted) {",
                            "        list = [...list].sort((a,b)=>toValue(a)-toValue(b))",
                            "    }",
                            "    let lowIndex = 0",
                            "    let highIndex = list.length - 1",
                            "    let midIndex",
                            "    while (lowIndex <= highIndex) {",
                            "        midIndex = Math.floor((lowIndex + highIndex) / 2)",
                            "        const midValue = toValue(list[midIndex])",
                            "",
                            "        if (midValue === targetValue) {",
                            "            return [ midIndex-1, midIndex, midIndex+1 ] // Found the target, return its index",
                            "        } else if (midValue < targetValue) {",
                            "            lowIndex = midIndex + 1 // Target is in the right half",
                            "        } else {",
                            "            highIndex = midIndex - 1 // Target is in the left half",
                            "        }",
                            "    }",
                            "    // Target is not in the array",
                            "    // NOTE! lowIndex and highIndex are misnomers at this point!",
                            "    //       lowIndex > highIndex always",
                            "    return [ highIndex, null, lowIndex ]",
                            "}",
                            "// ex:",
                            "var [low, index, high] = binarySearch({",
                            "    find: 4.5,",
                            "    isSorted: true,",
                            "    toValue: each=>each.v,",
                            "    in: [ {v:0},{v:1}, {v:2}, {v:3}, {v:4}, {v:5}, {v:6}, {v:7}, {v:8}, {v:9}, {v:10} ],",
                            "})",
                ]
            },
            "sort": {
                "prefix": "sort",
                "body": [
                    ".sort((a,b,c)=>(c=typeof a,(c=='string'&&c==typeof b) ? a.localeCompare(b) : a-b )) // smallToBig",
                ]
            },
            "sortBy": {
                "prefix": "sortBy",
                "body": [
                    ".sort((a,b)=>a.$0 - b.$0) // smallToBig",
                ]
            },
            "throw": {
                "prefix": "throw",
                "body": [
                    "throw Error(`$0`)"
                ],
                "description": "Throw an error with a message"
            },
            "raise": {
                "prefix": "raise",
                "body": [
                    "throw Error(`$0`)"
                ],
                "description": "Throw an error with a message"
            },
            "sortMapByKeys": {
                "prefix": "sortMapByKeys",
                "body": [
                    "// sortMapByKeys",
                    "var sorted = new Map([...$0.entries()].sort((a,b,c)=>(a=a[0],b=b[0],c=typeof a,(c=='string'&&c==typeof b) ? a.localeCompare(b) : a-b )))"
                ],
            },
            "sortMapByValues": {
                "prefix": "sortMapByValues",
                "body": [
                    "// sortMapByValues",
                    "var sorted = new Map([...$0.entries()].sort((a,b,c)=>(a=a[1],b=b[1],c=typeof a,(c=='string'&&c==typeof b) ? a.localeCompare(b) : a-b )))"
                ],
            },
            "sortObjectByKeys": {
                "prefix": "sortObjectByKeys",
                "body": [
                    "// sortObjectByKeys",
                    "var sorted = Object.fromEntries([...Object.entries($0)].sort((a,b,c)=>(a=a[0],b=b[0],c=typeof a,(c=='string'&&c==typeof b) ? a.localeCompare(b) : a-b )))"
                ],
            },
            "sortObjectByValues": {
                "prefix": "sortObjectByValues",
                "body": [
                    "// sortObjectByValues",
                    "var sorted = Object.fromEntries([...Object.entries($0)].sort((a,b,c)=>(a=a[1],b=b[1],c=typeof a,(c=='string'&&c==typeof b) ? a.localeCompare(b) : a-b )))"
                ],
            },
            "def_setSubtract": {
                "prefix": "def_setSubtract",
                "body": [
                    "function setSubtract({value, from}) {",
                    "    let source = from // this assignment is not just for naming (FYI)",
                    "    let detractor = value",
                    "    // we don't need to force the larger container to be a set",
                    "    // we want to do as little data copying/conversion as possible",
                    "    let sourceSize = source.size || source.length || 0",
                    "    if (sourceSize == null) { // convert iterator/generator",
                    "        source = new Set(source)",
                    "        sourceSize = source.size",
                    "    }",
                    "    // make sure detractor has a size (but do as little conversion as possible)",
                    "    let detractorSize = detractor.size || detractor.length || 0",
                    "    if (detractorSize == null) { // convert iterator/generator",
                    "        detractor = new Set(detractor)",
                    "        detractorSize = detractor.size",
                    "    }",
                    "    ",
                    "    // ",
                    "    // source is smaller => iterate over it",
                    "    // ",
                    "    if (sourceSize < detractorSize) {",
                    "        const outputSet = new Set() // required to avoid duplicates (if source is not a set)",
                    "        (detractor instanceof Set) || (detractor=new Set(detractor))",
                    "        for (const each of source) {",
                    "            // if the detractor wasn't going to remove it, then it belongs in the output",
                    "            if (!detractor.has(each)) {",
                    "                outputSet.add(each)",
                    "            }",
                    "        }",
                    "        return outputSet",
                    "    // ",
                    "    // detractor is smaller => iterate over it",
                    "    // ",
                    "    } else {",
                    "        // make sure source is a copy",
                    "        (source == from) && (source=new Set(source))",
                    "        // remove all the ones in detractor",
                    "        for (const eachValueBeingRemoved of detractor) {",
                    "            source.delete(eachValueBeingRemoved)",
                    "        }",
                    "        return source",
                    "    }",
                    "}",
                    "// non-mutating",
                    "var subset = setSubtract({value: setA, from: setB})"
                ],
            },
            "def_setSubtract": {
                "prefix": "def_setSubtract",
                "body": [
                    "function setSubtract({value, from}) {",
                    "    let source = from",
                    "    let detractor = value",
                    "    // make sure source has a size (but do as little conversion as possible)",
                    "    let sourceSize = source.size || source.length",
                    "    if (!sourceSize) {",
                    "        source = new Set(source)",
                    "        sourceSize = source.size",
                    "    }",
                    "    // make sure detractor has a size (but do as little conversion as possible)",
                    "    let detractorSize = detractor.size || detractor.length",
                    "    if (!detractorSize) {",
                    "        detractor = new Set(detractor)",
                    "        detractorSize = detractor.size",
                    "    }",
                    "    ",
                    "    // ",
                    "    // source is smaller => iterate over it",
                    "    // ",
                    "    if (sourceSize < detractorSize) {",
                    "        const outputSet = new Set() // required to avoid duplicates (if source is not a set)",
                    "        !(detractor instanceof Set) && (detractor=new Set(detractor))",
                    "        for (const each of source) {",
                    "            // if the detractor wasn't going to remove it, then it belongs in the output",
                    "            if (!detractor.has(each)) {",
                    "                outputSet.add(each)",
                    "            }",
                    "        }",
                    "        return outputSet",
                    "    // ",
                    "    // detractor is smaller => iterate over it",
                    "    // ",
                    "    } else {",
                    "        // make sure source is a copy",
                    "        !(source != from) && (source=new Set(source))",
                    "        // remove all the ones in detractor",
                    "        for (const eachValueBeingRemoved of detractor) {",
                    "            source.delete(eachValueBeingRemoved)",
                    "        }",
                    "        return source",
                    "    }",
                    "}",
                ],
            },
            "def_slices": {
                "prefix": "def_slices",
                "body": [
                    "/**",
                    " * Combinations",
                    " *",
                    " * @example",
                    " * ```js",
                    " *     combinations([1,2,3])",
                    " *     // [[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]",
                    " *",
                    " *     combinations([1,2,3], 2)",
                    " *     // [[1,2],[1,3],[2,3]]",
                    " *",
                    " *     combinations([1,2,3], 3, 2)",
                    " *     // [[1,2],[1,3],[2,3],[1,2,3]]",
                    " * ```",
                    " */",
                    "const combinations = function* (elements, maxLength, minLength) {",
                    "    // derived loosely from: https://lowrey.me/es6-javascript-combination-generator/",
                    "    if (maxLength === minLength && minLength === undefined) {",
                    "        minLength = 1",
                    "        maxLength = elements.length",
                    "    } else {",
                    "        maxLength = maxLength || elements.length",
                    "        minLength = minLength === undefined ? maxLength : minLength",
                    "    }",
                    "",
                    "    if (minLength !== maxLength) {",
                    "        for (let i = minLength; i <= maxLength; i++) {",
                    "            yield* combinations(elements, i, i)",
                    "        }",
                    "    } else {",
                    "        if (maxLength === 1) {",
                    "            yield* elements.map((each) => [each])",
                    "        } else {",
                    "            for (let i = 0; i < elements.length; i++) {",
                    "                for (const next of combinations(elements.slice(i + 1, elements.length), maxLength - 1, maxLength - 1)) {",
                    "                    yield [elements[i], ...next]",
                    "                }",
                    "            }",
                    "        }",
                    "    }",
                    "}",
                    "//ex: combinations([1,2,3]) // [[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]",
                    "",
                    "/**",
                    " * All Possible Slices",
                    " *",
                    " * @example",
                    " * ```js",
                    " *     slices([1,2,3])",
                    " *     // [",
                    " *     //   [[1],[2],[3]],",
                    " *     //   [[1],[2,3]],",
                    " *     //   [[1,2],[3]],",
                    " *     //   [[1,2,3]],",
                    " *     // ]",
                    " *     // note: doesnt contain [[1,3], [2]]",
                    " * ```",
                    " */",
                    "const slices = function* (elements) {",
                    "    const slicePoints = count({ start: 1, end: numberOfPartitions.length - 1 })",
                    "    for (const combination of combinations(slicePoints)) {",
                    "        combination.sort()",
                    "        let prev = 0",
                    "        const slices = []",
                    "        for (const eachEndPoint of [...combination, elements.length]) {",
                    "            slices.push(elements.slice(prev, eachEndPoint))",
                    "            prev = eachEndPoint",
                    "        }",
                    "        yield slices",
                    "    }",
                    "}",
                    "//ex: slices([1,2,3])",
                ],
            },
            "def_combinations": {
                "prefix": "def_combinations",
                "body": [
                    "/**",
                    " * Combinations",
                    " *",
                    " * @example",
                    " * ```js",
                    " *     combinations([1,2,3])",
                    " *     // [[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]",
                    " *",
                    " *     combinations([1,2,3], 2)",
                    " *     // [[1,2],[1,3],[2,3]]",
                    " *",
                    " *     combinations([1,2,3], 3, 2)",
                    " *     // [[1,2],[1,3],[2,3],[1,2,3]]",
                    " * ```",
                    " */",
                    "const combinations = function* (elements, {maxLength, minLength}={}) {",
                    "    // derived loosely from: https://lowrey.me/es6-javascript-combination-generator/",
                    "    if (maxLength == minLength && minLength == null) {",
                    "        minLength = 1",
                    "        maxLength = elements.length",
                    "    } else {",
                    "        if (maxLength === 0) {",
                    "            return",
                    "        }",
                    "        maxLength = maxLength || elements.length",
                    "        minLength = minLength === undefined ? maxLength : minLength",
                    "    }",
                    "",
                    "    if (minLength !== maxLength) {",
                    "        for (let i = minLength; i <= maxLength; i++) {",
                    "            yield* combinations(elements, {maxLength: i, minLength: i})",
                    "        }",
                    "    } else {",
                    "        if (maxLength === 1) {",
                    "            yield* elements.map((each) => [each])",
                    "        } else {",
                    "            for (let i = 0; i < elements.length; i++) {",
                    "                for (const next of combinations(elements.slice(i + 1, elements.length), {maxLength: maxLength - 1, minLength: maxLength - 1})) {",
                    "                    yield [elements[i], ...next]",
                    "                }",
                    "            }",
                    "        }",
                    "    }",
                    "}",
                    "//ex: combinations([1,2,3], {maxLength:}) // [[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]",
                ],
            },
            "def_numberOfCombinations": {
                "prefix": "def_numberOfCombinations",
                "body": [
                            "function numberOfCombinations({numberOfDigits, numberOfPossibleValues}) {",
                    "    if (numberOfDigits < 0 || numberOfDigits > numberOfPossibleValues) {",
                    "        return 0",
                    "    }",
                    "    if (numberOfDigits === 0 || numberOfDigits === numberOfPossibleValues) {",
                    "        return 1",
                    "    }",
                    "",
                    "    const useBigInt = numberOfPossibleValues > 57 // in the worst case (numberOfDigits=56/2) the output will be above Number.MAX_SAFE_INTEGER (9007199254740990)",
                    "",
                    "    if (!useBigInt) {",
                    "        // Fast floating-point implementation for small values",
                    "        numberOfDigits = Math.min(numberOfDigits, numberOfPossibleValues - numberOfDigits)",
                    "        let result = 1",
                    "        for (let i = 1; i <= numberOfDigits; i++) {",
                    "            result *= numberOfPossibleValues - i + 1",
                    "            result /= i",
                    "        }",
                    "        return Math.round(result) // in case of floating-point error",
                    "    } else {",
                    "        // BigInt version for larger values",
                    "        numberOfPossibleValues = BigInt(numberOfPossibleValues)",
                    "        numberOfDigits = BigInt(numberOfDigits)",
                    "        numberOfDigits = numberOfDigits > numberOfPossibleValues - numberOfDigits ? numberOfPossibleValues - numberOfDigits : numberOfDigits",
                    "        let result = 1n",
                    "        for (let i = 1n; i <= numberOfDigits; i++) {",
                    "            result = (result * (numberOfPossibleValues - i + 1n)) / i",
                    "        }",
                    "        return result",
                    "    }",
                    "}",
                    "//ex: numberOfCombinations({numberOfDigits: 5, numberOfPossibleValues: 10}) // 252",
                ],
            },
            
            // TODO: sort randomNormal, intersection
        }
            // maybe some graph-theory stuff
            function frequencyCount(iterable, {valueToKey=null, sort=false}={}) {
                valueToKey = valueToKey || ((each)=>each)
                const counts = new Map()
                for (let element of iterable) {
                    element = valueToKey(element)
                    counts.set(element, (counts.get(element)||0)+1)
                }
                if (sort) {
                    if (sort > 0) {
                        return new Map([...counts.entries()].sort((a,b)=>b[1]-a[1]))
                    }
                    return new Map([...counts.entries()].sort((a,b)=>a[1]-b[1]))
                }
                return counts
            }
            
            // combinationOfChoices
            // permutation
            // jsdoc
        
        const baseSuggestions = Object.entries(suggestions).map(([key, { prefix, body, description }]) => ({
            label: key,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            insertText: typeof body == "string" ? body : body.join("\n"),
            documentation: description,
            range: null,
        }))
        
        var identifierEntries = []
        setInterval(() => {
            // reparse (normally pass in the old tree for faster parsing, but for some reason it breaks things)
            tree = parser.parse(editor.getValue())
            let identifiers = [...new Set(tree.rootNode.quickQuery(`(identifier)`).map(each=>each.text).filter(each=>each.length > 1))]
            // Fix Monaco not giving variable name suggestions inside of strings (for some reason)
            identifierEntries = identifiers.map(key=>({
                label: key,
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: key,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "var: "+key,
                range: null,
            }))
        }, 2000)

        monaco.languages.registerCompletionItemProvider("javascript", {
            provideCompletionItems: function (model, position) {
                const word = model.getWordUntilPosition(position)
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                }
                
                for (let each of baseSuggestions) {
                    each.range = range
                }
                for (let each of identifierEntries) {
                    each.range = range
                }

                return {
                    suggestions: [
                        {
                            label: "todo",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: "// TODO: $1",
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Insert a TODO comment",
                            range: range,
                        },
                        ...baseSuggestions,
                        ...identifierEntries,
                    ],
                }
            },
        })
    }
}, 1000)