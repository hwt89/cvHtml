function Validator (formSelector, inputTag, messageError, invalid, cvGroup){
    // hàm xử lý html dom để lấy ra thẻ để truyền errormessage
    function getParent (element, selector){
        while (element.parentElement){
            if (element.parentElement.matches(selector)){
                return element.parentElement
            }
            element = element.parentElement;
        }
    }
     // Hàm thực hiện validate
     function handleValidate (event){
        var rules = formRules[event.target.name];
        var errorMessage;

        // Lấy ra errorMessage từ mảng rules 
        for (var rule of rules){
            errorMessage = rule(event.target.value)
            if(errorMessage) break;
        }
        // Xử lý khi có lỗi errorMessage
        if (errorMessage){
            var formGroup = getParent(event.target, inputTag);
            if(formGroup){
                formGroup.classList.add(invalid);
                var formMessage = formGroup.querySelector(messageError);
                if(formMessage){
                     formMessage.innerText = errorMessage;
                }
            }
        }
        return !errorMessage;
    };
    // hàm tắt hiệu ứng lỗi 
    function handleClearError (event){
        var formGroup = getParent(event.target, inputTag);
        if(formGroup.classList.contains(invalid)){
            formGroup.classList.remove(invalid);
            var formMessage = formGroup.querySelector(messageError);
            if(formMessage){
                formMessage.innerText = '';
            }
        }
    }
     // biến lưu lại thông tin các trường
     var infoList = {};
    // Object lưu những thẻ trong form
    var formRules = {};
    /**
     ** Quy ước khởi tạo rules:
            - Nếu có lỗi thì trả về các errorMessage
            - Nếu không có lỗi thì trả về undifined */

    // Object lưu các method xử lý các rules
    var validateRules = {
        required: (value) =>{
            return value ? undefined : "Vui lòng nhập thông tin"
        },
        email: (value) => {
            var regex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            return regex.test(value) ? undefined : "Vui lòng nhập đúng dịnh dạng email"
        },
        min: (min) => {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} ký tự` 
            }
        },
        phone: (value) => {
            // Biểu thức chính quy kiểm tra chuỗi có chưa ký tự là chữ cái 
            var regExp = /[a-zA-Z]/g;
            // Kiểm tra ký tự đặc biệt 
            var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

            return  !regExp.test(value) && !format.test(value) ? undefined : `Vui lòng nhập đúng số điện thoại`
        }
    };
    // Cách để lấy ra method xử lý trong validateRules: validateRules['tên method cần lấy'] Vd: validateRules['required']
    // Tạo biến lưu trữ form cần validate
    var formElement = document.querySelector(formSelector);
    console.log(formElement)
    // Check hàm có nhận được biến formSelector
    if(formElement){
        // Lấy các thẻ có attribute là name và rules 
        var inputs = formElement.querySelectorAll('[name][rules]')
        // Lưu thông tin name và rules cho object formRules
        for (var input of inputs) {
            formRules[input.name] = input.getAttribute('rules')
           
            var rules = input.getAttribute('rules').split('|')
            // sau khi tách dấu | ra khỏi các rules để lấy thông tin các method như required
            // bước tiếp theo ta sử dụng vòng lặp để tách tiếp dấu : ra khỏi rules password nữa 
            for(var rule of rules){
                var ruleInfo;
                if(rule.includes(':')){
                    ruleInfo = rule.split(':')
                    // gán phần tử đã cắt đi dấu ':' vào mảng rule ban đầu 
                    rule = ruleInfo[0];
                    // riêng với hàm min thì mỗi lần chạy gặp phải hàm min sẽ gán biến min
                    // vào hàm và chạy hàm bên trong hàm min 
                    validateRules[rule] = validateRules[rule](ruleInfo[1])
                }
                // gán các phương thức required, email, ... bằng các hàm thực thi trong
                // valudateRules
                // Sau khi chạy qua else thì formRules sẽ là 1 mảng lúc nào ta sẽ dùng phương thức push để gán hàm thực thi
                if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(validateRules[rule]);
                }
                // Lần đầu tiên formRules là 1 object rỗng sẽ gán cho nó thành mảng bao gồm các hàm thực thi
                else{
                   formRules[input.name] = [validateRules[rule]];
                }
            } 
             // Lắng nghe sự kiện để validate
            input.onblur = handleValidate;
             // Tắt hiệu ứng lỗi khi bắt đầu nhập vào thẻ input
            input.oninput = handleClearError;
        }
    }
    // Lấy dữ liệu nút submit
    var submitBtn = formElement.querySelector('button')
    // var checkDisplay = false;
    // Hàm lắng nghe sự kiến khi bấm vào nut submit
    submitBtn.onclick = (event) => {
        event.preventDefault();
        var isValid = true;
        var inputs = formElement.querySelectorAll('[name][rules]');
        for (var input of inputs){
            if(!handleValidate({target: input})){
                isValid = false;
            }
        }
        if (isValid){
                //**  Lấy ra dữ liệu của các trường khi bấm vào nút submit
                // Lấy ra các thẻ có attribute name lưu vào biến EnableInputs
                // lúc này biến enableIputs sẽ có dạng là 1 nodeList và không thể dùng các method của array
                 var enableInputs = formElement.querySelectorAll('[name]')
                 // Convert enableInputs sang dạng array
                infoList = Array.from(enableInputs).reduce((value, input)=>{
                    value[input.name] = input.value;
                    return value;
                },{});
                console.log(infoList)
                formElement.style.display="none"
                
            }
    }
     // Biến lưu lại cv 
     var cvTag = document.querySelector(cvGroup)
     // lay du lieu nut eidt trong cv
     var editBtn = cvTag.querySelector('button')
      
    
        editBtn.onclick = () =>{
            // if(formElement.style.display == "none"){
            //     formElement.style.display = "flex"
            // }
            formElement.style.display = "flex"
            checkDisplay = true;
         }
    
     

}
/* Cách dùng:
1) file html phải có các trường input để nhập thông tin 
2) phải có 1 khối bao quanh toàn bộ các trường tròng form
3) trong các trường input phải có các attribute như rules, name 
4) name: dùng để nhập tên của trường đó 
5) rules: để nhập cá luật của trường đó. Hiện tại có 4 trường:
    +) required: để tránh việc thông tin nhập vào rỗng 
    +) min: kiểm tra độ dài min
    +) email: nhập đúng dịnh dạng email
    +) phone: nhập đúng định dạng số */