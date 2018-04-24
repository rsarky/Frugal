$(document).ready(() => {
    var ctx1 = document.getElementById("expensePieChart").getContext('2d')
    var ctx2 = document.getElementById("incomePieChart").getContext('2d')
    $.ajax({
        method: 'get',
        url: 'http://localhost:5000/get-chart-data'
    })
        .done((data) => {
            let chart_data = data
            let arr_chart_data = []
            for (item in chart_data) arr_chart_data.push(chart_data[item])
            console.log(chart_data)
            var myChart = new Chart(ctx1, {
                type: 'pie',
                data: {
                    labels: ["Food", "Travel", "Utilities","Laundry" ,"Others" ],
                    datasets: [{
                        data: arr_chart_data,
                        backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"]
                    }]
                }
            });
        })

    $.ajax({
        method: 'get',
        url: 'http://localhost:5000/get-chart-data-income'
    })
        .done((data) => {
            let chart_data = data
            let arr_chart_data = []
            for (item in chart_data) arr_chart_data.push(chart_data[item])
            console.log(chart_data)
            var myChart = new Chart(ctx2, {
                type: 'pie',
                data: {
                    labels: ["Salary", "Parents", "Others"],
                    datasets: [{
                        data: arr_chart_data,
                        backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f"]
                    }]
                }
            });
        })

})
